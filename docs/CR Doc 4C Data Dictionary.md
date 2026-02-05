# CDoc C --- Data Dictionary

A complete, standardised definition of every field used across the
Candid Labs ecosystem.

## 1. Purpose

To provide a single source of truth for:

-   Column names

-   Data types

-   Definitions

-   Allowed values / formats

-   Cross‑table dependencies

-   Business rules

This ensures consistency across scripts, dashboards, and reporting.

## 2. Structure

Each field is described as follows:

**Field Name** **Data Type:** Text / Number / Date / Boolean **Source:**
Xero / KMI / Derived / Manual **Description:** Clear definition
**Validation Rules:** Format / constraints **Used In:** Tables where the
field appears

## 3. Core Field Definitions (Phase 1)

### 3.1 SALES_REVENUE_MASTER

  ------------------------------------------------------------------------------------------------
  **Field**             **Data      **Description**   **Source**   **Validation**      **Used In**
                        Type**                                                         
  --------------------- ----------- ----------------- ------------ ------------------- -----------
  Transaction_ID        Text        Unique            Derived      Regex               Revenue
                                    YYYYMMDD-####                  \\\\d{8}-\\\\d{4}   Master

  Invoice_Date          Date        Parsed invoice    Xero         Must be valid date  Revenue
                                    date                                               Master

  Invoice_Number        Text        Xero invoice ref  Xero         Non-empty           All Rev
                                                                                       tables

  Distributor_Name      Text        Customer name     Xero         Must match mapping  Mapping,
                                                                                       Revenue

  Internal_Venue_Name   Text        Mapped venue name Mapping      Dropdown            Revenue

  Account_ID            Text        Unique venue ID   Derived      Non-empty           Tracking,
                                                                                       Rev

  SKU_Name              Text        Product           Xero         Non-empty           Revenue
                                    description                                        

  Quantity_Cans         Number      Raw quantity      Xero         \>= -999999         Revenue

  Quantity_Cases        Number      Quantity/24       Derived      Numeric             Revenue

  Invoice_Value_IDR     Number      Invoice Total IDR Xero         \>= 0               Revenue

  Revenue_IDR           Number      Same as invoice   Derived      \>= 0               Revenue
                                    value                                              

  Market                Text        Region            Mapping      Dropdown            Revenue

  City                  Text        City              Mapping      Dropdown            Revenue

  Channel               Text        Channel           Mapping      Dropdown            Revenue

  Group_Name            Text        Grouping          Mapping      Dropdown            Revenue
  ------------------------------------------------------------------------------------------------

### 3.2 RECEIVABLE_DETAIL_CLEAN

(Derived from Xero Receivable Invoice Detail)

  -----------------------------------------------------------------------
  **Field**               **Type**                **Description**
  ----------------------- ----------------------- -----------------------
  Invoice_Date            Date                    Invoice date (parsed)

  Customer_Name           Text                    Customer/display name

  Invoice_Number          Text                    Xero invoice reference

  Line_Description        Text                    SKU description

  Quantity                Number                  Raw quantity

  Invoice_Total_IDR       Number                  Total per line

  Status                  Text                    draft / approved /
                                                  voided / deleted
  -----------------------------------------------------------------------

### 3.3 ACCOUNT_TRACKING

  -----------------------------------------------------------------------
  **Field**               **Type**                **Description**
  ----------------------- ----------------------- -----------------------
  Account_ID              Text                    Unique identifier

  Name                    Text                    Venue name

  Distributor_Name        Text                    From mapping

  First_Sale_Date         Date                    First recorded sale

  Last_Sale_Date          Date                    Most recent sale

  Total_12M_IDR           Number                  12‑month revenue

  Status                  Text                    Active / Dormant / Lost
  -----------------------------------------------------------------------

### 3.4 CONFIG_MAPPING

  -----------------------------------------------------------------------
  **Field**               **Type**                **Description**
  ----------------------- ----------------------- -----------------------
  Raw_Value               Text                    Xero text to map

  Internal_Venue_Name     Text                    Clean name

  Market                  Text                    Region

  City                    Text                    City

  Channel                 Text                    Channel

  Group_Name              Text                    Group classification
  -----------------------------------------------------------------------

## 4. Update Rules

-   Updated whenever a new field is introduced.

-   Should always match TAB STRUCTURE.

-   Versioned as part of CDoc releases.

-   Required input for Looker model updates.

## 5. Future Expansion

-   COGS fields

-   Full production model

-   SKU dimension table

-   Distributor dimension table

-   Profitability metrics

End of Docs C.
