# Consult Calendar View (LWC)

A custom Lightning Web Component (LWC) that displays a weekly view of **Consult Requests** and allows navigation between weeks.

## 🚀 Overview
This component retrieves and displays consult request records from Salesforce using the `getListUi` wire adapter.  
It supports:
- Viewing consults for the current week
- Navigating to previous or next weeks
- Opening a consult record directly from the calendar view

## 🧩 Key Features
- Displays consult requests from:
  - `CR_Phone_This_Week` list view
  - `CR_Phone` list view
- Groups consults by weekday (Mon–Fri)
- Shows callback time, consultant, specialty, and PCP name
- Supports “Previous Week,” “Next Week,” and “Current Week” navigation

## 🛠️ Technical Details
- Uses `lightning/uiListApi` for data retrieval
- Uses `NavigationMixin` for record page navigation
- Automatically sorts records by creation date
- Filters and formats callback times for display

## Configure Your Salesforce DX Project

The `sfdx-project.json` file contains useful configuration information for your project. See [Salesforce DX Project Configuration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm) in the _Salesforce DX Developer Guide_ for details about this file.

## Read All About It

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
