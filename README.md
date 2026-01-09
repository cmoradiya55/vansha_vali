# Vanshavali - Pedhinamu Certificate Application

A Next.js web application for generating Pedhinamu (Genealogy) certificates with support for both Hayati (Existence) and Maran (Death) certificates. The application is built with Next.js, Ionic React, and Capacitor for mobile app conversion.

## Features

- **Two Form Pages:**
  - હયાતી (Hayati) - Existence/Life certificate
  - મરણ (Maran) - Death certificate

- **Interactive Family Tree:** Dynamic family tree builder with add/remove functionality
- **PDF Generation:** Generates 2-page landscape legal size PDFs
- **Mobile Responsive:** Fully responsive design that works on all devices
- **Capacitor Ready:** Can be converted to native iOS and Android apps

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Ionic React** - UI components and mobile support
- **Capacitor** - Native mobile app conversion
- **jsPDF** - PDF generation

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- For mobile app development: Xcode (iOS) and Android Studio (Android)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Mobile App Setup (Capacitor)

### Initial Setup

1. Build the Next.js application:
```bash
npm run build
```

2. Sync Capacitor:
```bash
npm run cap:sync
```

### iOS Development

1. Open in Xcode:
```bash
npm run cap:open ios
```

2. Build and run from Xcode

### Android Development

1. Open in Android Studio:
```bash
npm run cap:open android
```

2. Build and run from Android Studio

## Project Structure

```
├── app/
│   ├── hayati/          # Hayati (Existence) form page
│   ├── maran/           # Maran (Death) form page
│   ├── layout.tsx       # Root layout with Ionic imports
│   └── page.tsx         # Home page (redirects to hayati)
├── components/
│   ├── Layout.tsx       # Shared layout with header and sidebar
│   └── FamilyTree.tsx   # Interactive family tree component
├── utils/
│   └── pdfGenerator.ts  # PDF generation utility
└── capacitor.config.ts  # Capacitor configuration
```

## PDF Generation

The PDF generator creates a 2-page landscape legal size (8.5" x 14") PDF:

- **Page 1:** Contains all form data before the "રૂબરૂ પંચનો જવાબ" heading
- **Page 2:** Contains all data after that heading, starting with the Panch response section

The PDF is automatically downloaded when clicking the "પ્રિન્ટ" (Print) button.

## Form Fields

### Common Fields
- Location (મોજે, તાલુકો, જીલ્લો)
- Family tree with dynamic members
- Panch (witness) details
- Signatures and declarations

### Hayati Specific
- Applicant declaration
- Age fields for family members

### Maran Specific
- Death details
- Applicant's relation to deceased
- DHL fields for Panch
- Existing and total deaths count

## Development Notes

- All form data is stored in component state (not persisted to database)
- Placeholder text is used throughout the forms
- Gujarati font (Noto Sans Gujarati) is loaded for proper text rendering
- The application is fully responsive and works on mobile devices

## License

Private project - All rights reserved
