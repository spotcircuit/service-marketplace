# Business CSV Import/Export Format

## Quick Start

```bash
# Get the template
node database/business-csv-handler.js template

# Export all businesses
node database/business-csv-handler.js export businesses.csv

# Import businesses
node database/business-csv-handler.js import new-businesses.csv
```

## CSV Columns

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| name | **Yes** | Business name | "ABC Dumpster Rental" |
| phone | No | Phone number | "555-0100" |
| email | No | Email(s), semicolon-separated for multiple | "info@example.com; sales@example.com" |
| website | No | Business website URL | "https://example.com" |
| address | No | Street address | "123 Main Street" |
| city | No | City name | "New York" |
| state | No | State code (2 letters) | "NY" |
| zipcode | No | ZIP/postal code | "10001" |
| category | No | Business category (defaults to "Dumpster Rental") | "Waste Management" |
| rating | No | Rating (0-5) | "4.5" |
| reviews | No | Number of reviews | "125" |
| latitude | No | GPS latitude | "40.7128" |
| longitude | No | GPS longitude | "-74.0060" |
| hours | No | Business hours | "Mon-Fri: 8am-6pm; Sat: 9am-4pm" |
| services | No | Services offered, semicolon-separated | "10 yard dumpster; 20 yard dumpster" |
| description | No | Business description | "Professional dumpster rental service" |
| logo_url | No | URL to logo image | "https://example.com/logo.png" |
| gallery_urls | No | Gallery images, semicolon-separated | "https://example.com/img1.jpg; https://example.com/img2.jpg" |

## Important Notes

### Multiple Emails
- Use semicolons to separate multiple emails: `"email1@example.com; email2@example.com"`
- First email becomes the primary business email
- Additional emails are stored as claim campaign contacts

### Required Fields
- Only `name` is required
- Records without names will be skipped

### Duplicate Detection
- Duplicates are detected by: business name + city + state
- Duplicate records are automatically skipped during import

### Special Characters
- Fields containing commas, quotes, or newlines are automatically escaped
- Use double quotes around fields with special characters

## Example CSV

```csv
name,phone,email,website,address,city,state,zipcode,category,rating,reviews
"ABC Dumpster Co","555-0100","info@abc.com; sales@abc.com","https://abc.com","123 Main St","New York","NY","10001","Dumpster Rental",4.5,89
"XYZ Waste","555-0200","contact@xyz.com","","456 Oak Ave","Los Angeles","CA","90001","Waste Management",4.2,45
```

## Data Import Process

1. **Validation**: Checks for required fields and data types
2. **Duplicate Check**: Skips businesses that already exist
3. **Business Creation**: Creates business record with primary email
4. **Contact Creation**: If multiple emails provided, creates claim campaign with all contacts
5. **Token Generation**: Automatically generates claim tokens for new businesses

## Data Export Process

1. **Fetches All Data**: Exports all businesses from database
2. **Combines Emails**: Merges business email with claim contact emails
3. **Formats Output**: Creates properly escaped CSV file
4. **Preserves Data**: Maintains all fields including arrays as semicolon-separated values