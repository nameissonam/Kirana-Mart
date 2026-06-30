import React from "react";

export const Search = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
  </svg>
);

export const ShoppingCart = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);

export const User = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

export const Plus = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const Minus = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
  </svg>
);

export const Trash = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

export const ArrowRight = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

export const CheckCircle = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const TrendingUp = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);

export const Package = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

export const Home = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v4.875h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

export const PlusCircle = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const ChevronDown = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

export const LogOut = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
);

export const Filter = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v3.059-3.059zm0 0c-2.755 0-5.455.232-8.083.678-.533.09-.917.556-.917 1.096v3.059 3.059zm0 0v18m0-18c-1.854 0-3.62.59-5.062 1.624L4.17 9.75M12 3c1.854 0 3.62.59 5.062 1.624l2.768 2.126M12 21a9.003 9.003 0 008.354-5.646l-2.768-2.126M12 21a9.003 9.003 0 01-8.354-5.646l2.768-2.126" />
  </svg>
);

export const AlertTriangle = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

export const Edit = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

export const RefreshCw = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

export const Star = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.15-.316.606-.316.756 0l2.224 4.507 4.973.723c.348.051.487.48.236.725l-3.6 3.508.85 4.955c.06.347-.306.613-.617.449l-4.444-2.337-4.444 2.337c-.31.164-.677-.102-.617-.449l.85-4.955-3.6-3.508c-.25-.245-.11-.674.236-.725l4.973-.723 2.224-4.507z" />
  </svg>
);

export const Sparkles = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.187L15 15l-5.187.904zM18 10.5l-.562 1.688L15.75 12l1.688.562.562 1.688.562-1.688 1.688-.562-1.688-.562-.562-1.688zM19.5 3l-.375 1.125L18 4.5l1.125.375.375 1.125.375-1.125 1.125-.375-1.125-.375-.375-1.125z" />
  </svg>
);

export const ShieldCheck = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

export const Close = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const CreditCard = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-5.25-12h18.75c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125H3.375c-.621 0-1.125-.504-1.125-1.125V5.25c0-.621.504-1.125 1.125-1.125z" />
  </svg>
);

export const Store = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.015a2.993 2.993 0 002.25 1.015c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0L3.004 5.25a1.5 1.5 0 011.496-1.5h15a1.5 1.5 0 011.496 1.5l.004 4.099" />
  </svg>
);

export const Menu = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

export const X = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const LayoutDashboard = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
  </svg>
);

export const List = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

export const BarChart3 = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 6.75c0-.621.504-1.125 1.125-1.125h2.25C13.496 5.625 14 6.129 14 6.75v13.125c0 .621-.504 1.125-1.125 1.125h-2.25c-.621 0-1.125-.504-1.125-1.125V6.75zm9.75 0c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v13.125c0 .621-.504 1.125-1.125 1.125h-2.25c-.621 0-1.125-.504-1.125-1.125V6.75z" />
  </svg>
);

export const ShoppingBag = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z" />
  </svg>
);

export const Users = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 001.591-.023 9.72 9.72 0 00.75-1.385A5.403 5.403 0 0020.573 16.5a1.663 1.663 0 00-1.575-2.999 8.987 8.987 0 01-.75 8.627zM9 12.75a3.75 3.75 0 110-7.5A3.75 3.75 0 019 12.75zm0 0c2.708 0 5.217.712 7.4 1.964M9 12.75c-2.708 0-5.217.712-7.4 1.964m0-4.179v.75a9 9 0 011.844.852A9.022 9.022 0 012.25 12c0 .469.054.927.161 1.369" />
  </svg>
);

export const Settings = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.592c.55 0 1.02.398 1.11.94a29.26 29.26 0 001.923 6.859c.321.895.851 1.83 1.623 2.601.772.77 1.707 1.3 2.602 1.62 3.860 1.27 5.546 3.136 5.546 5.342v1.214c0 .944-.379 1.6-1.25 1.962-.528.243-1.333.637-2.169 1.05-.894.461-1.846.953-2.345 1.501-.342.342-.384.848-.094 1.277.636.984 1.925 1.848 3.807 2.039 1.05.114 1.854.786 1.854 1.907 0 1.255-.365 2.07-1.081 2.589-.56.426-1.251.788-2.01 1.067-.859.35-1.774.72-2.313 1.275a2.25 2.25 0 01-3.19-2.008 29.26 29.26 0 00-.922-6.6c-.321-.895-.851-1.83-1.623-2.601a5.25 5.25 0 00-2.602-1.62c-3.86-1.27-5.546-3.136-5.546-5.342v-1.214c0-.944.379-1.6 1.25-1.962.528-.243 1.333-.637 2.169-1.05.894-.461 1.846-.953 2.345-1.501.342-.342.384-.848.094-1.277C5.672 5.5 4.383 4.636 2.501 4.445c-1.05-.114-1.854-.786-1.854-1.907 0-1.255.365-2.07 1.081-2.589.56-.426 1.251-.788 2.01-1.067.859-.35 1.774-.72 2.313-1.275a2.25 2.25 0 013.19 2.008 29.26 29.26 0 00.922 6.6z" />
  </svg>
);

export const ChevronRight = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5L15.75 12l-7.5 7.5" />
  </svg>
);

export const Calendar = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

export const MapPin = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

export const AlertCircle = ({ className = "w-5 h-5", strokeWidth = 2, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={strokeWidth} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
