# Ride Aggregator Web App

A modern, production-ready ride aggregator platform built with React, featuring three distinct dashboards for customers, drivers, and administrators.

## 🚀 Tech Stack

- **Frontend Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Icons**: Lucide React

## ✨ Features

### Customer Dashboard
- Book rides with autocomplete location search
- Multiple vehicle types (Ride, Premium, Bike, Courier)
- View recent rides and history
- Active offers and promotional codes
- Wallet management
- Safety features
- Real-time notifications

### Driver Dashboard
- Online/Offline status toggle
- Accept or decline ride requests
- View earnings and performance metrics
- Ride history
- Customer ratings
- Navigation assistance
- Performance analytics

### Admin Dashboard
- User management (customers & drivers)
- Platform analytics and metrics
- Revenue tracking
- System alerts and monitoring
- Ride management
- Safety oversight
- Settings and configuration

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components (Button, Card, SearchBar, etc.)
│   ├── customer/        # Customer-specific components
│   ├── driver/          # Driver-specific components
│   ├── admin/           # Admin-specific components
│   └── layout/          # Layout components (Sidebar, Navbar)
├── pages/
│   ├── customer/        # Customer dashboard pages
│   ├── driver/          # Driver dashboard pages
│   └── admin/           # Admin dashboard pages
├── store/               # Zustand state management
├── services/            # API services
├── utils/               # Utility functions
```

## 🛠️ Installation

1. Clone the repository
2. Install dependencies using your preferred package manager
3. Configure environment variables (see `.env.example`)
4. Run the project using the appropriate script

## ⚙️ Configuration & Environment Variables

- All sensitive configuration should be set via environment variables.
- See `.env.example` and `backend/.env.example` for required variables.

## 🚦 Running the Project

- Frontend: `npm run dev` (from the frontend directory)
- Backend: `npm start` or equivalent (from the backend directory)

## 🗂️ Project Structure

- `src/` - Main source code
- `components/` - UI components
- `pages/` - Page-level components
- `store/` - State management
- `services/` - API and business logic
- `utils/` - Utility functions

---

For more details, see inline code comments and directory-level README files if present.


```
src/
├── components/
│   ├── common/          # Reusable components (Button, Card, SearchBar, etc.)
│   ├── customer/        # Customer-specific components
│   ├── driver/          # Driver-specific components
│   ├── admin/           # Admin-specific components
│   └── layout/          # Layout components (Sidebar, Navbar)
├── pages/
│   ├── customer/        # Customer dashboard pages
│   ├── driver/          # Driver dashboard pages
│   └── admin/           # Admin dashboard pages
├── store/               # Zustand state management
├── services/            # API services
├── utils/               # Utility functions
├── hooks/               # Custom hooks
└── assets/              # Static assets
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd "ride aggregator"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Update environment variables**
   Edit `.env` and add your API endpoint:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🎨 Design Features

- **Modern UI**: Clean, Uber-inspired design
- **Responsive**: Mobile, tablet, and desktop support
- **Dark/Light Theme**: Dark header with soft light content sections
- **Smooth Animations**: Framer Motion powered transitions
- **Beautiful Icons**: Lucide icons for consistent visual language
- **Hover Effects**: Subtle animations on interactive elements
- **Rounded Cards**: Modern card-based layout with shadows

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔐 Authentication

The app includes a role-based authentication system:
- Click on "Customer", "Driver", or "Admin" on the landing page
- Authentication state is managed via Zustand
- Protected routes ensure role-specific access

## 🎯 Key Components

### Common Components
- `Button`: Versatile button with variants (primary, secondary, danger, success, outline, ghost)
- `Card`: Animated card component with hover effects
- `SearchBar`: Autocomplete search with suggestions
- `Input`: Form input with validation
- `Modal`: Animated modal dialog
- `StatsCard`: Statistics display card with trends

### Layout Components
- `Sidebar`: Navigation sidebar with icons
- `Navbar`: Top navigation with notifications and profile
- `DashboardLayout`: Wrapper layout for all dashboards

## 🔌 API Integration

The app is pre-configured with Axios interceptors for:
- Authentication token injection
- Error handling
- Response transformation

API endpoints are defined in `src/services/api.js`

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to customize the color palette:
```javascript
theme: {
  extend: {
    colors: {
      primary: { ... }
    }
  }
}
```

### Animations
Custom animations are defined in Tailwind config:
- `fade-in`
- `slide-up`
- `slide-down`

## 📦 Build Optimization

- Code splitting by route
- Tree shaking for minimal bundle size
- Lazy loading of components
- CSS purging with Tailwind

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙋‍♂️ Support

For support, please open an issue in the repository or contact the development team.

---

Built with ❤️ using React + Vite
