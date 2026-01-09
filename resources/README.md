# App Icons and Splash Screens

This folder contains the source assets for generating app icons and splash screens for iOS and Android.

## Required Files

### App Icon
- **File:** `icon.png`
- **Size:** 1024×1024 pixels
- **Format:** PNG
- **Requirements:**
  - Square image (1:1 aspect ratio)
  - No rounded corners (platforms will apply their own masks)
  - High quality, centered design
  - Transparent background recommended

### Splash Screen (Optional)
- **File:** `splash.png`
- **Size:** 2732×2732 pixels
- **Format:** PNG
- **Requirements:**
  - Square image
  - Artwork should be centered
  - Safe area: Keep important content within the center area

## Generating Icons

Once you have placed your `icon.png` file in this folder, run:

```bash
npm run cap:assets
```

This will automatically generate all required icon sizes for:
- iOS (iPhone and iPad)
- Android (all density variants)

## Platform-Specific Icons

If you want different icons for iOS and Android:
- iOS: Place icon at `resources/ios/icon.png`
- Android: Place icon at `resources/android/icon.png`

## Current Status

⚠️ **Action Required:** Place your 1024×1024 `icon.png` file in this folder, then run `npm run cap:assets` to generate all platform icons.

