# Setup Instructions

## Initial Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Development Server:**
   ```bash
   npm run dev
   ```

3. **Access the Application:**
   - Open http://localhost:3000
   - You'll be redirected to the Hayati page
   - Use the sidebar to navigate between Hayati and Maran pages

## Building for Production

1. **Build the Application:**
   ```bash
   npm run build
   ```

2. **Start Production Server:**
   ```bash
   npm start
   ```

## Mobile App Conversion (Capacitor)

### Prerequisites
- Node.js 18+
- For iOS: Xcode and CocoaPods
- For Android: Android Studio and Android SDK

### Steps

1. **Build the Next.js app:**
   ```bash
   npm run build
   ```

2. **Initialize Capacitor (if not already done):**
   ```bash
   npx cap init
   ```
   - App name: Vanshavali
   - App ID: com.vanshavali.pedhinamu
   - Web dir: out

3. **Add Platforms:**
   ```bash
   npx cap add ios
   npx cap add android
   ```

4. **Sync Capacitor:**
   ```bash
   npm run cap:sync
   ```

5. **Open in Native IDEs:**
   - iOS: `npm run cap:open ios` or `npx cap open ios`
   - Android: `npm run cap:open android` or `npx cap open android`

6. **Build and Run:**
   - iOS: Build and run from Xcode
   - Android: Build and run from Android Studio

### App Icons Setup

To set up the app icon for iOS and Android:

1. **Prepare your source icon:**
   - Create or obtain a 1024×1024 pixel PNG image of your VANSHAVALI logo
   - The icon should be square with no rounded corners (platforms will apply their own masks)
   - Save it as `icon.png` in the `resources` folder

2. **Generate platform-specific icons:**
   ```bash
   npm run cap:assets
   ```
   This will automatically generate all required icon sizes for both iOS and Android platforms.

3. **Sync the icons to native projects:**
   ```bash
   npm run cap:sync
   ```

**Note:** If you have the VANSHAVALI logo image file, place it at `resources/icon.png` (1024×1024 pixels) and run the command above to generate all platform icons automatically.

## Notes

- The application uses placeholder text throughout
- Form data is not persisted to a database
- PDFs are generated client-side using jsPDF
- The app is fully responsive and works on mobile browsers
- Ionic components are used for UI consistency and mobile app conversion

## Troubleshooting

### Icons not showing
- Ensure `ionicons` package is installed
- Check that Ionic CSS is imported in `app/layout.tsx`

### PDF generation issues
- Ensure jsPDF is properly installed
- Check browser console for errors

### Capacitor sync issues
- Make sure you've built the Next.js app first (`npm run build`)
- Check that `out` directory exists after build
- Verify `capacitor.config.ts` has correct `webDir` path

