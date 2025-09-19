# **App Name**: Cite Grabber

## Core Features:

- ISBN Input: Accepts an ISBN from the user via a web form with a text field and submit button.
- Data Scraping Tool: Retrieves book data (Title, Author, ISBN-13, ISBN-10, Edition, Publisher, Year, and optional links) from ISBN Search using the provided ISBN. Uses a headless browser or HTML parser (e.g., Cheerio) to consistently extract the following selectors from the <div class="bookinfo"> element:

  - `<h1>` → Title

  - `<p><strong>ISBN-13:</strong>` → ISBN-13

  - `<p><strong>ISBN-10:</strong>` → ISBN-10

  - `<p><strong>Author:</strong>` → Author

  - `<p><strong>Edition:</strong>` → Edition

  - `<p><strong>Binding:</strong>` → Binding (optional, not used in MLA)

  - `<p><strong>Publisher:</strong>` → Publisher

  - `<p><strong>Published:</strong>` → Year
- MLA Citation Builder Tool: Generates an MLA citation string from the scraped data, formatted as:

  ```
  Author. *Title*. Edition, Publisher, Year.
  ```

- Conditional formatting rules:

  - If Edition = "1", omit edition info.

  - If Title contains edition info in parentheses, remove it.

  - Italicize the title.

- Example output:

  ```
  Timberlake, Karen C. *Chemistry: An Introduction to General, Organic, & Biological Chemistry*. 10th ed., Pearson College Div, 2008.
  ```
- JSON Output: Formats the scraped data and generated MLA citation into a JSON object:

  ```
  {
    "isbn13": "9780136019701",
    "mla_citation": "Timberlake, Karen C. *Chemistry: An Introduction to General, Organic, & Biological Chemistry*. 10th ed., Pearson College Div, 2008.",
    "author": "Karen C. Timberlake",
    "title": "Chemistry: An Introduction to General, Organic, & Biological Chemistry",
    "edition": "10",
    "publisher": "Pearson College Div",
    "year": "2008"
  }
  ```
- Citation Display: Displays the generated MLA citation in a formatted, readable block below the form.
- Confirmation Message: Shows a success message confirming the citation has been added to the user’s personal Google Sheet.

## Style Guidelines:

- Light grayish-blue `#E8F0FE` (calm, professional feel).
- Dark blue `#3F51B5` (trust, authority).
- Vibrant orange `#FF9800` (for call-to-action buttons and notifications).
- `"Belleza"`, sans-serif (professional, slightly stylized).
- `"Alegreya"`, serif (high readability).
- Simple, line-based icons for search, confirm, and status.
- Clean, single-column design optimized for readability.