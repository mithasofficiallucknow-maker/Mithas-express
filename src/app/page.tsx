"use client";

import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogIn,
  UserPlus,
  Home,
  Package,
  Clock,
  Wallet,
  User,
  Bell,
  Phone,
  Mail,
  MapPin,
  Camera,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Award,
  Gift,
  Share2,
  Shield,
  Map,
  Navigation,
  Sun,
  Moon,
  Globe,
  MessageCircle,
  PhoneCall,
  AlertTriangle,
  Users,
  Search,
  Filter,
  Eye,
  EyeOff,
  Lock,
  Calendar,
  Truck,
  Check,
  XCircle,
  Clock as ClockIcon,
  DollarSign,
  BarChart3,
  PieChart,
  QrCode,
  Smartphone,
  BadgeCheck,
  Medal,
  Trophy,
  Flame,
  CloudRain,
  Wind,
  Thermometer,
  HelpCircle,
  FileText,
  Upload,
  UserCheck,
  Zap,
  RefreshCw,
  Settings,
  LogOut,
  ChevronDown,
  MoreVertical,
  Plus,
  Minus,
  ThumbsUp,
  MessageSquare,
  Headphones,
  ShieldAlert,
  Fingerprint,
  Car,
  IdCard,
  Building,
  Banknote,
  IndianRupee,
} from "lucide-react";

// ============================================
// 1. FIREBASE CONFIGURATION (Self-Contained)
// ============================================
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { getStorage, FirebaseStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// ============================================
// 2. TYPES & INTERFACES
// ============================================

// User Types
interface DeliveryPartner {
  uid: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  pan: string;
  selfieURL?: string;
  vehicleRC?: string;
  drivingLicense?: string;
  bankDetails: {
    accountNumber: string;
    ifsc: string;
    accountHolderName: string;
    upiId?: string;
  };
  status: "pending" | "active" | "warning" | "suspended" | "blocked";
  onboardingFee: {
    total: number;
    paid: number;
    remaining: number;
    recovered: number;
    history: OnboardingDeduction[];
  };
  referralCode: string;
  referredBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface OnboardingDeduction {
  date: Timestamp;
  amount: number;
  week: string;
  remaining: number;
}

// Order Types
interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNotes?: string;
  vendorName: string;
  vendorAddress: string;
  productName: string;
  productCost: number;
  quantity: number;
  totalAmount: number;
  paymentMode: "COD" | "Online";
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  status: "assigned" | "accepted" | "going_to_pickup" | "picked_up" | "out_for_delivery" | "delivered" | "cancelled" | "failed";
  distance: number;
  estimatedEarning: number;
  pickupLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  deliveryLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  deliveryProof?: string;
  assignedAt: Timestamp;
  acceptedAt?: Timestamp;
  pickedUpAt?: Timestamp;
  deliveredAt?: Timestamp;
  cancelledAt?: Timestamp;
  codAmount?: number;
  notes?: string;
}

// Shift Types
interface Shift {
  id: string;
  time: string;
  startTime: string;
  endTime: string;
  bookedBy?: string;
  bookedAt?: Timestamp;
  isPeak: boolean;
  available: boolean;
}

// Earnings Types
interface Earnings {
  weekly: number;
  monthly: number;
  total: number;
  perOrder: number;
  perKm: number;
  deliveries: number;
  incentives: number;
  bonuses: number;
  tips: number;
  deductions: number;
  netPayable: number;
}

// Notification Types
interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "order" | "shift" | "payment" | "incentive" | "bonus" | "referral" | "achievement" | "document" | "weather" | "safety" | "fraud" | "system";
  read: boolean;
  timestamp: Timestamp;
  action?: string;
  data?: any;
}

// Referral Types
interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  referredName: string;
  status: "pending" | "active" | "completed";
  bonus: number;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

// Achievement Types
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Timestamp;
  progress: number;
  target: number;
}

// Fraud Alert Types
interface FraudAlert {
  id: string;
  partnerId: string;
  level: "low" | "medium" | "high";
  type: string;
  description: string;
  detectedAt: Timestamp;
  resolved: boolean;
  resolvedAt?: Timestamp;
}

// Complaint Types
interface Complaint {
  id: string;
  type: "customer" | "vendor";
  partnerId: string;
  partnerName: string;
  partnerPhone: string;
  orderId?: string;
  description: string;
  status: "open" | "investigating" | "resolved";
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
}

// ============================================
// 3. AUTH CONTEXT
// ============================================

interface AuthContextType {
  user: User | null;
  partner: DeliveryPartner | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, mobile: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePartner: (data: Partial<DeliveryPartner>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// ============================================
// 4. MAIN COMPONENT
// ============================================

export default function Home() {
  // --- AUTH STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<DeliveryPartner | null>(null);
  const [loading, setLoading] = useState(true);

  // --- UI STATE ---
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("Home");
  const [isOnline, setIsOnline] = useState(false);

  // --- DATA STATE ---
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // --- FORM STATE ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerMobile, setRegisterMobile] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  // --- SHIFT SELECTION ---
  const [selectedShift, setSelectedShift] = useState<string>("");
  const [showShiftBooking, setShowShiftBooking] = useState(false);

  // --- ORDER MANAGEMENT ---
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [deliveryProof, setDeliveryProof] = useState<File | null>(null);
  const [deliveryProofPreview, setDeliveryProofPreview] = useState<string>("");

  // --- ADMIN STATE ---
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");

  // ============================================
  // HERO BANNERS
  // ============================================
  const HERO_BANNERS = [
    "/hero-banner-1.png",
    "/hero-banner-2.png",
    "/hero-banner-3.png",
  ];

  // ============================================
  // SHIFTS DATA
  // ============================================
  const SHIFT_SLOTS = [
    { id: "s1", time: "7:00 AM - 10:00 AM", start: "07:00", end: "10:00", isPeak: false },
    { id: "s2", time: "10:00 AM - 12:00 PM", start: "10:00", end: "12:00", isPeak: false },
    { id: "s3", time: "12:00 PM - 2:00 PM", start: "12:00", end: "14:00", isPeak: true },
    { id: "s4", time: "2:00 PM - 4:00 PM", start: "14:00", end: "16:00", isPeak: false },
    { id: "s5", time: "4:00 PM - 6:00 PM", start: "16:00", end: "18:00", isPeak: false },
    { id: "s6", time: "6:00 PM - 8:00 PM", start: "18:00", end: "20:00", isPeak: true },
    { id: "s7", time: "8:00 PM - 9:00 PM", start: "20:00", end: "21:00", isPeak: false },
    { id: "s8", time: "9:00 PM - 11:00 PM", start: "21:00", end: "23:00", isPeak: false },
  ];

  // ============================================
  // AUTH FUNCTIONS
  // ============================================

  const login = useCallback(async (email: string, password: string) => {
    setLoginLoading(true);
    setLoginError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch partner data
      const partnerDoc = await getDoc(doc(db, "partners", user.uid));
      if (partnerDoc.exists()) {
        setPartner(partnerDoc.data() as DeliveryPartner);
      }
      
      setIsLoginOpen(false);
      setActiveTab("Home");
    } catch (error: any) {
      setLoginError(error.message);
    } finally {
      setLoginLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, mobile: string) => {
    setRegisterLoading(true);
    setRegisterError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile
      await updateProfile(user, { displayName: name });

      // Create partner document
      const partnerData: Partial<DeliveryPartner> = {
        uid: user.uid,
        name,
        email,
        mobile,
        address: "",
        pan: "",
        bankDetails: {
          accountNumber: "",
          ifsc: "",
          accountHolderName: "",
          upiId: "",
        },
        status: "pending",
        onboardingFee: {
          total: 1899,
          paid: 0,
          remaining: 1899,
          recovered: 0,
          history: [],
        },
        referralCode: `MIT${user.uid.substring(0, 6).toUpperCase()}`,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      await setDoc(doc(db, "partners", user.uid), partnerData);
      setPartner(partnerData as DeliveryPartner);
      setIsRegisterOpen(false);
      setActiveTab("Home");
    } catch (error: any) {
      setRegisterError(error.message);
    } finally {
      setRegisterLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setPartner(null);
    setUser(null);
    setActiveTab("Home");
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  // ============================================
  // AUTH STATE LISTENER
  // ============================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const partnerDoc = await getDoc(doc(db, "partners", user.uid));
          if (partnerDoc.exists()) {
            setPartner(partnerDoc.data() as DeliveryPartner);
          }
        } catch (error) {
          console.error("Error fetching partner:", error);
        }
      } else {
        setPartner(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ============================================
  // NOTIFICATIONS LISTENER
  // ============================================

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("partnerId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AppNotification[];
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, [user]);

  // ============================================
  // ORDERS LISTENER
  // ============================================

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("deliveryPartnerId", "==", user.uid),
      orderBy("assignedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(ordersData);
    });

    return () => unsubscribe();
  }, [user]);

  // ============================================
  // SHIFTS LISTENER
  // ============================================

  useEffect(() => {
    const q = query(collection(db, "shifts"), orderBy("startTime"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const shiftsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Shift[];
      setShifts(shiftsData);
    });

    return () => unsubscribe();
  }, []);

  // ============================================
  // AUTO SLIDER
  // ============================================

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ============================================
  // HANDLERS
  // ============================================

  const handleMarkNotificationRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  }, []);

  const handleBookShift = useCallback(async (shiftId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "shifts", shiftId), {
        bookedBy: user.uid,
        bookedAt: serverTimestamp(),
        available: false,
      });
      setSelectedShift(shiftId);
      setShowShiftBooking(false);
    } catch (error) {
      console.error("Error booking shift:", error);
    }
  }, [user]);

  const handleAcceptOrder = useCallback(async (orderId: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "accepted",
        acceptedAt: serverTimestamp(),
        deliveryPartnerId: user?.uid,
        deliveryPartnerName: user?.displayName,
      });
    } catch (error) {
      console.error("Error accepting order:", error);
    }
  }, [user]);

  const handlePickupOrder = useCallback(async (orderId: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "picked_up",
        pickedUpAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error picking up order:", error);
    }
  }, []);

  const handleDeliverOrder = useCallback(async (orderId: string, proofURL?: string) => {
    try {
      const updateData: any = {
        status: "delivered",
        deliveredAt: serverTimestamp(),
      };
      if (proofURL) {
        updateData.deliveryProof = proofURL;
      }
      await updateDoc(doc(db, "orders", orderId), updateData);

      // Calculate earnings
      const order = orders.find(o => o.id === orderId);
      if (order && user) {
        const earnings = (order.distance * 6) + 12; // ₹6/km + ₹12/order
        await updateDoc(doc(db, "partners", user.uid), {
          "earnings.total": (partner?.earnings?.total || 0) + earnings,
        });
      }
    } catch (error) {
      console.error("Error delivering order:", error);
    }
  }, [orders, user, partner]);

  const handleUploadDeliveryProof = useCallback(async (orderId: string, file: File) => {
    if (!user) return;
    try {
      const storageRef = ref(storage, `delivery-proofs/${orderId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await handleDeliverOrder(orderId, downloadURL);
      setDeliveryProof(null);
      setDeliveryProofPreview("");
    } catch (error) {
      console.error("Error uploading proof:", error);
    }
  }, [user, handleDeliverOrder]);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const earnings: Earnings = {
    weekly: orders.filter(o => o.status === "delivered" && o.deliveryPartnerId === user?.uid).reduce((sum, o) => sum + (o.distance * 6 + 12), 0),
    monthly: orders.filter(o => o.status === "delivered" && o.deliveryPartnerId === user?.uid).reduce((sum, o) => sum + (o.distance * 6 + 12), 0),
    total: orders.filter(o => o.status === "delivered" && o.deliveryPartnerId === user?.uid).reduce((sum, o) => sum + (o.distance * 6 + 12), 0),
    perOrder: 12,
    perKm: 6,
    deliveries: orders.filter(o => o.status === "delivered" && o.deliveryPartnerId === user?.uid).length,
    incentives: 0,
    bonuses: 0,
    tips: 0,
    deductions: partner?.onboardingFee?.recovered || 0,
    netPayable: 0,
  };
  earnings.netPayable = earnings.total + earnings.incentives + earnings.bonuses + earnings.tips - earnings.deductions;

  // ============================================
  // RENDER: AUTH PROVIDER
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-navy-600">Loading Mithaas Express...</p>
        </div>
      </div>
    );
  }

  const authValue: AuthContextType = {
    user,
    partner,
       loading,
    login,
    register,
    logout,
    resetPassword,
    updatePartner: async (data) => {
      if (!user) return;
      await updateDoc(doc(db, "partners", user.uid), data);
      setPartner((prev) => prev ? { ...prev, ...data } : null);
    },
  };

  return (
    <AuthContext.Provider value={authValue}>
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        <div className="relative min-h-screen pb-24 md:pb-0 bg-[#F8FAFC] dark:bg-navy-900 text-[#0F172A] dark:text-white transition-colors duration-300">
          {/* HEADER */}
          <Header
            user={user}
            partner={partner}
            onOpenLogin={() => setIsLoginOpen(true)}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            notifications={notifications}
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            onMarkNotificationRead={handleMarkNotificationRead}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            language={language}
            setLanguage={setLanguage}
            onLogout={logout}
          />

          {/* MAIN CONTENT */}
          <main className="flex-1">
            {!user ? (
              // HOMEPAGE (Not Logged In)
              <>
                <HeroSection
                  banners={HERO_BANNERS}
                  currentSlide={currentSlide}
                  setCurrentSlide={setCurrentSlide}
                  onOpenLogin={() => setIsLoginOpen(true)}
                />

                <BenefitsSection />

                <HowItWorksSection />

                <div className="max-w-7xl mx-auto px-4 py-16">
                  <div className="bg-gradient-to-r from-teal-600 to-navy-800 rounded-3xl p-8 md:p-12 text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      Ready to Start Earning?
                    </h2>
                    <p className="text-lg md:text-xl mb-8 text-teal-100 max-w-2xl mx-auto">
                      Join Mithaas Express today and become part of India's fastest-growing delivery network.
                    </p>
                    <button
                      onClick={() => setIsRegisterOpen(true)}
                      className="px-8 py-4 bg-white text-navy-800 rounded-full font-semibold hover:shadow-xl transition-all hover:scale-105"
                    >
                      Apply Now - ₹1,899 Onboarding
                    </button>
                    <p className="mt-4 text-sm text-teal-200">
                      ₹10 upfront, rest from weekly earnings
                    </p>
                  </div>
                </div>
              </>
            ) : (
              // DASHBOARD (Logged In)
              <>
                {activeTab === "Home" && (
                  <DashboardHome
                    user={user}
                    partner={partner}
                    orders={orders}
                    earnings={earnings}
                    isOnline={isOnline}
                    setIsOnline={setIsOnline}
                    notifications={notifications}
                    onViewOrder={(order) => {
                      setSelectedOrder(order);
                      setShowOrderDetails(true);
                    }}
                  />
                )}

                {activeTab === "Orders" && (
                  <OrdersView
                    orders={orders}
                    onAcceptOrder={handleAcceptOrder}
                    onPickupOrder={handlePickupOrder}
                    onDeliverOrder={handleDeliverOrder}
                    onUploadProof={handleUploadDeliveryProof}
                    onViewOrder={(order) => {
                      setSelectedOrder(order);
                      setShowOrderDetails(true);
                    }}
                  />
                )}

                {activeTab === "Shifts" && (
                  <ShiftsView
                    shifts={shifts}
                    SHIFT_SLOTS={SHIFT_SLOTS}
                    onBookShift={handleBookShift}
                    selectedShift={selectedShift}
                    user={user}
                  />
                )}

                {activeTab === "Earnings" && (
                  <EarningsView
                    earnings={earnings}
                    orders={orders}
                    partner={partner}
                  />
                )}

                {activeTab === "Profile" && (
                  <ProfileView
                    user={user}
                    partner={partner}
                    onUpdate={async (data) => {
                      await updateDoc(doc(db, "partners", user.uid), data);
                      setPartner((prev) => prev ? { ...prev, ...data } : null);
                    }}
                    referrals={referrals}
                    achievements={achievements}
                    fraudAlerts={fraudAlerts}
                  />
                )}

                {activeTab === "Admin" && user?.email === "admin@mithaas.com" && (
                  <AdminPanel
                    partners={[]}
                    orders={orders}
                    complaints={complaints}
                    fraudAlerts={fraudAlerts}
                  />
                )}
              </>
            )}
          </main>

          {/* BOTTOM NAVIGATION */}
          {user && (
            <BottomNavigation
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              user={user}
              notifications={notifications}
            />
          )}

          {/* MODALS */}
          {isLoginOpen && (
            <LoginModal
              isOpen={isLoginOpen}
              onClose={() => setIsLoginOpen(false)}
              onLogin={login}
              onSwitchToRegister={() => {
                setIsLoginOpen(false);
                setIsRegisterOpen(true);
              }}
              loading={loginLoading}
              error={loginError}
              email={loginEmail}
              setEmail={setLoginEmail}
              password={loginPassword}
              setPassword={setLoginPassword}
            />
          )}

          {isRegisterOpen && (
            <RegisterModal
              isOpen={isRegisterOpen}
              onClose={() => setIsRegisterOpen(false)}
              onRegister={register}
              onSwitchToLogin={() => {
                setIsRegisterOpen(false);
                setIsLoginOpen(true);
              }}
              loading={registerLoading}
              error={registerError}
              email={registerEmail}
              setEmail={setRegisterEmail}
              password={registerPassword}
              setPassword={setRegisterPassword}
              name={registerName}
              setName={setRegisterName}
              mobile={registerMobile}
              setMobile={setRegisterMobile}
            />
          )}

          {/* ORDER DETAILS MODAL */}
          {showOrderDetails && selectedOrder && (
            <OrderDetailsModal
              order={selectedOrder}
              onClose={() => {
                setShowOrderDetails(false);
                setSelectedOrder(null);
              }}
              onAccept={handleAcceptOrder}
              onPickup={handlePickupOrder}
              onDeliver={handleDeliverOrder}
              onUploadProof={handleUploadDeliveryProof}
              deliveryProof={deliveryProof}
              setDeliveryProof={setDeliveryProof}
              deliveryProofPreview={deliveryProofPreview}
              setDeliveryProofPreview={setDeliveryProofPreview}
            />
          )}
        </div>
      </div>
    </AuthContext.Provider>
  );
}

// ============================================
// 5. HEADER COMPONENT
// ============================================

function Header({
  user,
  partner,
  onOpenLogin,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  notifications,
  showNotifications,
  setShowNotifications,
  onMarkNotificationRead,
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  onLogout,
}: any) {
  const unreadCount = notifications?.filter((n: AppNotification) => !n.read).length || 0;

  return (
    <header className="sticky top-0 z-50 glass-effect dark:bg-navy-900/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10 md:w-12 md:h-12">
              <Image src="/Logo.png" alt="Mithaas Express" fill className="object-contain" />
            </div>
            <span className="text-xl md:text-2xl font-bold text-teal-600 dark:text-teal-400">
              Mithaas Express
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-700 transition"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-700 transition"
            >
              <Globe size={18} />
              <span className="text-sm font-medium">{language === "en" ? "EN" : "हिं"}</span>
            </button>

            {user ? (
              <>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-700 transition"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-3">
                  <div className="text-sm text-right">
                    <p className="font-medium">{user.displayName || "Partner"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {partner?.status || "Pending"}
                    </p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={onOpenLogin}
                  className="px-4 py-2 text-sm font-medium text-navy-700 dark:text-white hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg transition"
                >
                  Login
                </button>
                <button className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
                  Join Now
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700 transition"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-navy-700">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700"
              >
                <span>Dark Mode</span>
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button
                onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700"
              >
                <span>Language</span>
                <span>{language === "en" ? "English" : "हिंदी"}</span>
              </button>

              {user ? (
                <>
                  <div className="px-4 py-2">
                    <p className="font-medium">{user.displayName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="mx-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onOpenLogin}
                    className="mx-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Notifications Dropdown */}
        {showNotifications && user && (
          <div className="absolute right-0 top-full mt-2 w-80 md:w-96 max-h-96 overflow-y-auto bg-white dark:bg-navy-800 rounded-xl shadow-xl border border-gray-200 dark:border-navy-700 p-2">
            <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-navy-700">
              <h3 className="font-semibold">Notifications</h3>
              <span className="text-sm text-gray-500">{unreadCount} unread</span>
            </div>
            {notifications?.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications?.map((notif: AppNotification) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-navy-700 transition ${
                    !notif.read ? "bg-teal-50 dark:bg-navy-700/50" : ""
                  }`}
                  onClick={() => onMarkNotificationRead(notif.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notif.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notif.timestamp?.toDate?.()?.toLocaleDateString() || "Just now"}
                      </p>
                    </div>
                    {!notif.read && <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </header>
  );
}

// ============================================
// 6. HERO SECTION
// ============================================

function HeroSection({ banners, currentSlide, setCurrentSlide, onOpenLogin }: any) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
        {banners.map((banner: string, index: number) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={banner}
              alt={`Hero Banner ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/50 via-transparent to-transparent" />

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_: string, index: number) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? "w-8 bg-white" : "bg-white/50"
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev: number) => (prev - 1 + banners.length) % banners.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition z-10"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev: number) => (prev + 1) % banners.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition z-10"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* CTA Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center text-white max-w-2xl px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              Drive with Mithaas Express
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90 drop-shadow">
              Earn ₹12/order + ₹6/km • Weekly Payouts • Flexible Hours
            </p>
            <button
              onClick={onOpenLogin}
              className="px-8 py-4 bg-teal-600 text-white rounded-full font-semibold hover:bg-teal-700 transition shadow-lg hover:shadow-xl"
            >
              Start Earning Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// 7. BENEFITS SECTION
// ============================================

function BenefitsSection() {
  const benefits = [
    { icon: "💰", title: "Weekly Payout", desc: "Get your earnings credited directly to your bank every single week." },
    { icon: "⏰", title: "Flexible Hours", desc: "Choose your own login hours, shifts, and working days completely at your ease." },
    { icon: "📍", title: "Nearby Orders", desc: "Smart routing ensures you always get delivery orders within your local area." },
    { icon: "🚀", title: "Performance Bonus", desc: "Surge incentives, festival bonuses, and daily target multipliers." },
    { icon: "🛡️", title: "Secure Platform", desc: "Comprehensive on-trip accidental insurance and safety guardrails." },
    { icon: "📞", title: "24x7 Support", desc: "Dedicated rider-support hotline waiting to resolve live delivery issues." },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-navy-800 dark:text-white mb-4">
          Why Join Mithaas Express?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Join India's fastest-growing delivery network and enjoy these amazing benefits
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:scale-105"
          >
            <div className="text-4xl mb-4">{benefit.icon}</div>
            <h3 className="text-xl font-semibold text-navy-800 dark:text-white mb-2">
              {benefit.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{benefit.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================
// 8. HOW IT WORKS SECTION
// ============================================

function HowItWorksSection() {
  const steps = [
    { num: "01", title: "Register", desc: "Download the driver app and fill out your profile information." },
    { num: "02", title: "Verify Documents", desc: "Upload your DL, Document verification details, PAN, and vehicle registration details." },
    { num: "03", title: "Receive Orders", desc: "Turn on your availability toggle and grab dynamic delivery requests." },
    { num: "04", title: "Deliver", desc: "Pick up fresh sweets and snacks from partner nodes and deliver safely." },
    { num: "05", title: "Earn Weekly", desc: "Track earnings per order seamlessly and withdraw your weekly payouts." },
  ];

  return (
    <section className="bg-white dark:bg-navy-800 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-800 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Start your journey with Mithaas Express in 5 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {steps.map((step) => (
            <div key={step.num} className="text-center">
              <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">{step.num}</span>
              </div>
              <h3 className="font-semibold text-navy-800 dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// 9. DASHBOARD HOME
// ============================================

function DashboardHome({ user, partner, orders, earnings, isOnline, setIsOnline, notifications, onViewOrder }: any) {
  const newOrders = orders.filter((o: Order) => o.status === "assigned").length;
  const activeOrders = orders.filter((o: Order) => o.status === "accepted" || o.status === "going_to_pickup" || o.status === "picked_up" || o.status === "out_for_delivery").length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy-800 dark:text-white">
            Welcome back, {user?.displayName || "Partner"}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-4 py-2 rounded-full font-medium transition ${
              isOnline
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
          >
            {isOnline ? "🟢 Online" : "⚪ Offline"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<IndianRupee className="w-6 h-6 text-teal-600" />}
          label="Today's Earnings"
          value={`₹${earnings.weekly || 0}`}
          change="+12%"
        />
        <StatCard
          icon={<Package className="w-6 h-6 text-blue-600" />}
          label="New Orders"
          value={newOrders}
          change={`${newOrders} pending`}
        />
        <StatCard
          icon={<Truck className="w-6 h-6 text-orange-600" />}
          label="Active Orders"
          value={activeOrders}
          change="In progress"
        />
        <StatCard
          icon={<Award className="w-6 h-6 text-purple-600" />}
          label="Completion Rate"
          value="98%"
          change="+2%"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <QuickAction
          icon={<Package className="w-6 h-6" />}
          label="View Orders"
          onClick={() => {}}
          color="bg-teal-50 dark:bg-teal-900/20"
        />
        <QuickAction
          icon={<Clock className="w-6 h-6" />}
          label="Book Shift"
          onClick={() => {}}
          color="bg-purple-50 dark:bg-purple-900/20"
        />
        <QuickAction
          icon={<Wallet className="w-6 h-6" />}
          label="Earnings"
          onClick={() => {}}
          color="bg-green-50 dark:bg-green-900/20"
        />
        <QuickAction
          icon={<Users className="w-6 h-6" />}
          label="Refer & Earn"
          onClick={() => {}}
          color="bg-orange-50 dark:bg-orange-900/20"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-navy-800 dark:text-white">Recent Orders</h2>
          <button className="text-teal-600 hover:text-teal-700 font-medium">View All</button>
        </div>

        {orders.slice(0, 5).map((order: Order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-navy-700 rounded-lg cursor-pointer transition"
            onClick={() => onViewOrder(order)}
          >
            <div>
              <p className="font-medium text-navy-800 dark:text-white">{order.orderNumber}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {order.customerName} • {order.vendorName}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-navy-800 dark:text-white">₹{order.totalAmount}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${
                order.status === "delivered" ? "bg-green-100 text-green-700" :
                order.status === "assigned" ? "bg-yellow-100 text-yellow-700" :
                "bg-blue-100 text-blue-700"
              }`}>
                {order.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Fraud Alert Banner */}
      {partner?.status === "warning" && (
        <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-300">Security Alert</p>
            <p className="text-sm text-red-700 dark:text-red-400">
              Your account has been flagged for review. Please contact support immediately.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, change }: any) {
  return (
    <div className="bg-white dark:bg-navy-800 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className={`text-xs font-medium ${
          change.includes('+') ? 'text-green-600' : 'text-gray-500'
        }`}>
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold text-navy-800 dark:text-white">{value}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  );
}

function QuickAction({ icon, label, onClick, color }: any) {
  return (
    <button
      onClick={onClick}
      className={`${color} rounded-2xl p-4 text-center hover:scale-105 transition-all`}
    >
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-sm font-medium text-navy-800 dark:text-white">{label}</p>
    </button>
  );
}

// ============================================
// 10. ORDERS VIEW
// ============================================

function OrdersView({
  orders,
  onAcceptOrder,
  onPickupOrder,
  onDeliverOrder,
  onUploadProof,
  onViewOrder,
}: any) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = orders.filter((order: Order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendorName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    const colors: any = {
      assigned: "bg-yellow-100 text-yellow-700",
      accepted: "bg-blue-100 text-blue-700",
      going_to_pickup: "bg-indigo-100 text-indigo-700",
      picked_up: "bg-purple-100 text-purple-700",
      out_for_delivery: "bg-orange-100 text-orange-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      failed: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-navy-800 dark:text-white">Orders</h1>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-navy-700 rounded-lg bg-white dark:bg-navy-800 text-navy-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-navy-700 rounded-lg bg-white dark:bg-navy-800 text-navy-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="accepted">Accepted</option>
            <option value="going_to_pickup">Going to Pickup</option>
            <option value="picked_up">Picked Up</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order: Order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAccept={onAcceptOrder}
              onPickup={onPickupOrder}
              onDeliver={onDeliverOrder}
              onUploadProof={onUploadProof}
              onView={onViewOrder}
              getStatusColor={getStatusColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onAccept, onPickup, onDeliver, onUploadProof, onView, getStatusColor }: any) {
  const [showProofUpload, setShowProofUpload] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (proofFile) {
      await onUploadProof(order.id, proofFile);
      setProofFile(null);
      setShowProofUpload(false);
    }
  };

  return (
    <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-bold text-navy-800 dark:text-white">{order.orderNumber}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Customer:</span> {order.customerName}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Vendor:</span> {order.vendorName}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Amount:</span> ₹{order.totalAmount}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Product:</span> {order.productName} x{order.quantity}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Distance:</span> {order.distance.toFixed(1)} km
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Earning:</span> ₹{order.estimatedEarning || (order.distance * 6 + 12)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {order.status === "assigned" && (
            <button
              onClick={() => onAccept(order.id)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              Accept
            </button>
          )}

          {order.status === "accepted" && (
            <button
              onClick={() => onPickup(order.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Pickup
            </button>
          )}

          {(order.status === "picked_up" || order.status === "out_for_delivery") && (
            <button
              onClick={() => setShowProofUpload(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Deliver
            </button>
          )}

          <button
            onClick={() => onView(order)}
            className="px-4 py-2 bg-gray-200 dark:bg-navy-700 text-navy-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-navy-600 transition"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Proof Upload Modal */}
      {showProofUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-navy-800 dark:text-white mb-4">
              Upload Delivery Proof
            </h3>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Take a photo of the delivered order
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 dark:border-navy-600 rounded-lg"
              />
              {proofFile && (
                <p className="mt-2 text-sm text-green-600">{proofFile.name}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                disabled={!proofFile}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
              >
                Confirm Delivery
              </button>
              <button
                onClick={() => setShowProofUpload(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-navy-700 text-navy-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-navy-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// 11. SHIFTS VIEW
// ============================================

function ShiftsView({ SHIFT_SLOTS, onBookShift, selectedShift, user }: any) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const isShiftBooked = (slotId: string) => {
    return selectedShift === slotId;
  };

  const isSlotBooked = (slotId: string) => {
    // Check if the slot is booked by someone else
    return false; // Simplified
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-navy-800 dark:text-white">Shifts</h1>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
            selectedShift ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${selectedShift ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            {selectedShift ? 'Shift Booked' : 'No Shift Booked'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SHIFT_SLOTS.map((slot: any) => (
          <div
            key={slot.id}
            className={`bg-white dark:bg-navy-800 rounded-2xl p-4 shadow-sm transition ${
              isShiftBooked(slot.id) ? 'ring-2 ring-teal-500' : ''
            } ${isSlotBooked(slot.id) ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-navy-800 dark:text-white">{slot.time}</span>
              {slot.isPeak && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                  🔥 Peak
                </span>
              )}
            </div>

            {isShiftBooked(slot.id) ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Booked</span>
              </div>
            ) : isSlotBooked(slot.id) ? (
              <div className="text-sm text-gray-500">Booked by another partner</div>
            ) : (
              <button
                onClick={() => onBookShift(slot.id)}
                className="w-full mt-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              >
                Book Shift
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// 12. EARNINGS VIEW
// ============================================

function EarningsView({ earnings, orders, partner }: any) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-bold text-navy-800 dark:text-white mb-6">Earnings</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-navy-800 rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Weekly</p>
          <p className="text-2xl font-bold text-teal-600">₹{earnings.weekly || 0}</p>
        </div>
        <div className="bg-white dark:bg-navy-800 rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Monthly</p>
          <p className="text-2xl font-bold text-purple-600">₹{earnings.monthly || 0}</p>
        </div>
        <div className="bg-white dark:bg-navy-800 rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-navy-800 dark:text-white">₹{earnings.total || 0}</p>
        </div>
        <div className="bg-white dark:bg-navy-800 rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Deliveries</p>
          <p className="text-2xl font-bold text-orange-600">{earnings.deliveries || 0}</p>
        </div>
      </div>

      {/* Earning Details */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-navy-800 dark:text-white mb-4">Earning Breakdown</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-navy-700">
            <span className="text-gray-600 dark:text-gray-400">Per Order (₹12)</span>
            <span className="font-medium">₹{earnings.deliveries * 12}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-navy-700">
            <span className="text-gray-600 dark:text-gray-400">Per KM (₹6/km)</span>
            <span className="font-medium">₹{earnings.total - earnings.deliveries * 12}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-navy-700">
            <span className="text-gray-600 dark:text-gray-400">Incentives</span>
            <span className="font-medium">₹{earnings.incentives || 0}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-navy-700">
            <span className="text-gray-600 dark:text-gray-400">Bonuses</span>
            <span className="font-medium">₹{earnings.bonuses || 0}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-navy-700">
            <span className="text-gray-600 dark:text-gray-400">Tips</span>
            <span className="font-medium">₹{earnings.tips || 0}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-navy-700 text-red-600">
            <span>Registration Fee Deduction</span>
            <span>-₹{earnings.deductions || 0}</span>
          </div>
          <div className="flex justify-between py-2 font-bold text-lg">
            <span>Net Payable</span>
            <span className="text-teal-600">₹{earnings.netPayable || 0}</span>
          </div>
        </div>
      </div>

      {/* Registration Fee Status */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-navy-800 dark:text-white mb-4">Onboarding Fee Status</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Total Fee</span>
            <span className="font-medium">₹{partner?.onboardingFee?.total || 1899}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Paid</span>
            <span className="font-medium text-green-600">₹{partner?.onboardingFee?.paid || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Remaining</span>
            <span className="font-medium text-orange-600">₹{partner?.onboardingFee?.remaining || 1899}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-navy-700 rounded-full h-2">
            <div
              className="bg-teal-600 rounded-full h-2 transition-all"
              style={{
                width: `${((partner?.onboardingFee?.paid || 0) / (partner?.onboardingFee?.total || 1899)) * 100}%`,
              }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            ₹10 upfront, rest deducted from weekly earnings
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 13. PROFILE VIEW
// ============================================

function ProfileView({ user, partner, onUpdate, referrals, achievements, fraudAlerts }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: partner?.name || "",
    mobile: partner?.mobile || "",
    address: partner?.address || "",
    pan: partner?.pan || "",
    bankDetails: partner?.bankDetails || { accountNumber: "", ifsc: "", accountHolderName: "", upiId: "" },
  });

  const handleSave = async () => {
    await onUpdate(editData);
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-navy-800 dark:text-white">Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-teal-600 dark:text-teal-400" />
          </div>

          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  placeholder="Full Name"
                  className="w-full p-2 border border-gray-300 dark:border-navy-600 rounded-lg bg-white dark:bg-navy-700"
                />
                <input
                  type="text"
                  value={editData.mobile}
                  onChange={(e) => setEditData({ ...editData, mobile: e.target.value })}
                  placeholder="Mobile Number"
                  className="w-full p-2 border border-gray-300 dark:border-navy-600 rounded-lg bg-white dark:bg-navy-700"
                />
                <textarea
                  value={editData.address}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  placeholder="Address"
                  className="w-full p-2 border border-gray-300 dark:border-navy-600 rounded-lg bg-white dark:bg-navy-700"
                  rows={2}
                />
                <input
                  type="text"
                  value={editData.pan}
                  onChange={(e) => setEditData({ ...editData, pan: e.target.value })}
                  placeholder="PAN Number"
                  className="w-full p-2 border border-gray-300 dark:border-navy-600 rounded-lg bg-white dark:bg-navy-700"
                />
                <button
                  onClick={handleSave}
                  className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-navy-800 dark:text-white">{partner?.name}</h2>
                <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                <p className="text-gray-600 dark:text-gray-400">📱 {partner?.mobile || "Not provided"}</p>
                <p className="text-gray-600 dark:text-gray-400">📍 {partner?.address || "No address set"}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    partner?.status === "active" ? "bg-green-100 text-green-700" :
                    partner?.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    partner?.status === "warning" ? "bg-orange-100 text-orange-700" :
                    partner?.status === "suspended" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {partner?.status?.toUpperCase() || "PENDING"}
                  </span>
                  <span className="text-sm text-gray-500">Referral Code: {partner?.referralCode}</span>
                </div>
              </>
            )}
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-white dark:bg-navy-700 rounded-xl p-2 border border-gray-200 dark:border-navy-600">
              <QrCode className="w-full h-full text-navy-800 dark:text-white" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Partner QR Code</p>
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-navy-800 dark:text-white mb-4">Bank Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Account Holder</p>
            <p className="font-medium">{partner?.bankDetails?.accountHolderName || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Account Number</p>
            <p className="font-medium">{partner?.bankDetails?.accountNumber ? "••••" + partner.bankDetails.accountNumber.slice(-4) : "Not set"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">IFSC Code</p>
            <p className="font-medium">{partner?.bankDetails?.ifsc || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">UPI ID</p>
            <p className="font-medium">{partner?.bankDetails?.upiId || "Not set"}</p>
          </div>
        </div>
      </div>

      {/* Referrals */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-navy-800 dark:text-white mb-4">
          Referrals <span className="text-sm font-normal text-gray-500">({referrals?.length || 0})</span>
        </h2>
        {referrals?.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No referrals yet. Share your code!</p>
        ) : (
          <div className="space-y-2">
            {referrals.map((ref: any) => (
              <div key={ref.id} className="flex justify-between py-2 border-b border-gray-100 dark:border-navy-700">
                <span>{ref.referredName}</span>
                <span className={`text-sm ${
                  ref.status === "completed" ? "text-green-600" : "text-yellow-600"
                }`}>
                  {ref.status} • ₹{ref.bonus}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fraud Alerts */}
      {fraudAlerts?.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-4">
            <ShieldAlert className="inline w-5 h-5 mr-2" />
            Security Alerts
          </h2>
          <div className="space-y-2">
            {fraudAlerts.map((alert: any) => (
              <div key={alert.id} className="flex items-center gap-3 text-sm text-red-700 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>{alert.description}</span>
                <span className="text-xs text-red-500">{alert.level.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
      
