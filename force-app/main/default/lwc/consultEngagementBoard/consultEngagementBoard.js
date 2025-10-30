import { LightningElement, track, wire } from 'lwc';
import { getListUi } from 'lightning/uiListApi';
import { NavigationMixin } from 'lightning/navigation';

const MAX_RECORDS = 200;

export default class ConsultCalendarView extends NavigationMixin(LightningElement) {
    @track isLoading = false;
    @track error;
    @track calendarDays = null;
    @track currentWeekStart = null;
    @track allPhoneRecordsThisWeek = [];
    @track allPhoneRecords = [];
    @track showingThisWeek = true;

    getFieldValue(field) {
        if (!field) return null;
        return field.displayValue || field.value || null;
    }

    // Load current week consults
    @wire(getListUi, {
        objectApiName: 'Consult_Request__c',
        listViewApiName: 'CR_Phone_This_Week',
        pageSize: MAX_RECORDS
    })
    wiredPhoneThisWeek({ error, data }) {
        if (error) {
            this.error = error.body?.message || error.message;
            return;
        }
        if (data?.records?.records) {
            this.allPhoneRecordsThisWeek = this.mapPhoneRecords(data.records.records);
            this.initCurrentWeek();
            this.buildCalendarView(true);
        }
    }

    // Load all consults
    @wire(getListUi, {
        objectApiName: 'Consult_Request__c',
        listViewApiName: 'CR_Phone',
        pageSize: MAX_RECORDS
    })
    wiredAllPhoneList({ error, data }) {
        if (error) {
            this.error = error.body?.message || error.message;
            return;
        }
        if (data?.records?.records) {
            this.allPhoneRecords = this.mapPhoneRecords(data.records.records);
        }
    }

    mapPhoneRecords(rawRecords) {
        return rawRecords.map(r => {
            const name = this.getFieldValue(r.fields?.Name) || 'No Name';
            let specialty = this.getFieldValue(r.fields?.Consult_Callback_Preference__c) || 'Not Specified';
            if (specialty === 'Psychiatrist (30 minutes or less)') {
                specialty = 'Psychiatrist';
            }
            const modality = this.getFieldValue(r.fields?.Modality__c) || 'Not Specified';
            const consultant = this.getFieldValue(r.fields?.Consultant_lwc__c) || 'Not Specified';
            const pcpName = this.getFieldValue(r.fields?.PCP_Full_Name__c) || 'Not Provided';
            const callbackNumber = this.getFieldValue(r.fields?.Callback_Telephone_Number__c) || 'Not Provided';
            const callbackTimeRaw = this.getFieldValue(r.fields?.Callback_time__c);
            const createdDateRaw = this.getFieldValue(r.fields?.CreatedDate);

            const callbackTime = callbackTimeRaw ? new Date(callbackTimeRaw) : null;
            const formattedTime = callbackTime
                ? callbackTime.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
                : '';

            const createdDate = createdDateRaw ? new Date(createdDateRaw) : null;

            return {
                id: r.id,
                name,
                specialty,
                modality,
                consultant,
                pcpName,
                callbackNumber,
                callbackTime,
                formattedTime,
                createdDate
            };
        }).sort((a, b) => a.createdDate - b.createdDate);
    }

    // Week logic
    initCurrentWeek() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        monday.setHours(0, 0, 0, 0);
        this.currentWeekStart = monday;
    }

    handlePrevWeek() {
        const prevMonday = new Date(this.currentWeekStart);
        prevMonday.setDate(this.currentWeekStart.getDate() - 7);
        this.currentWeekStart = prevMonday;
        this.showingThisWeek = false;
        this.buildCalendarView();
    }

    handleNextWeek() {
        const nextMonday = new Date(this.currentWeekStart);
        nextMonday.setDate(this.currentWeekStart.getDate() + 7);
        this.currentWeekStart = nextMonday;
        this.showingThisWeek = false;
        this.buildCalendarView();
    }

    handleCurrentWeek() {
        this.showingThisWeek = true;
        this.initCurrentWeek();
        this.buildCalendarView(true);
    }

    buildCalendarView(useThisWeek = false) {
        const recordsToUse = useThisWeek || this.showingThisWeek
            ? this.allPhoneRecordsThisWeek
            : this.allPhoneRecords;

        if (!recordsToUse?.length || !this.currentWeekStart) {
            this.calendarDays = null;
            return;
        }

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const result = [];

        for (let i = 0; i < 5; i++) {
            const dayDate = new Date(this.currentWeekStart);
            dayDate.setDate(this.currentWeekStart.getDate() + i);

            const dateKey = dayDate.toISOString().split('T')[0];
            const formattedDate = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            const dayAppointments = recordsToUse.filter(rec => {
                if (!rec.callbackTime) return false;
                const recDate = new Date(rec.callbackTime.getFullYear(), rec.callbackTime.getMonth(), rec.callbackTime.getDate());
                return recDate.getTime() === dayDate.getTime();
            });

            result.push({
                dayName: days[i],
                dateKey,
                formattedDate,
                appointments: dayAppointments
            });
        }

        this.calendarDays = result;
    }

    handleAppointmentClick(event) {
        const recordId = event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: { recordId, objectApiName: 'Consult_Request__c', actionName: 'view' }
        });
    }
}