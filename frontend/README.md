# CyberSIO Chat Assistant Frontend

React frontend for the CyberSIO Chat Assistant with Radix UI components and theme support.

## Features

- **Radix UI Components**: Accessible, unstyled UI primitives
- **Theme Support**: Dark and light mode with smooth transitions
- **Modern UI/UX**: Professional, minimalist design
- **Responsive Design**: Works on all screen sizes
- **Toast Notifications**: User-friendly error and success messages

## Installation

```bash
npm install
```

## Running the app

```bash
npm start
```

The app will run on [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env` file in the frontend directory:

```
REACT_APP_API_URL=http://localhost:3001
```

Alternatively, you can configure the API URL in `public/config.js` which will be loaded via `window.config`.

## Theme

The app supports dark and light themes. Users can toggle between themes using the switch in the header. Theme preference is saved in localStorage.

## Components

- **ChatAssistant**: Main chat interface component
- **Button**: Radix-based button component
- **Input**: Styled input component
- **ScrollArea**: Custom scrollable area
- **Switch**: Theme toggle switch
- **Toast**: Notification system

## Styling

The app uses Tailwind CSS with custom theme variables for consistent theming. All colors are defined using HSL values in CSS variables for easy theme customization.
