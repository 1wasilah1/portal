import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/Layout";
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  PlusCircle,
  Navigation,
  UserRound,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logTokenInfo, getTokenInfo } from "@/utils/auth";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog-form";
import { InputField } from "@/components/ui/input-field";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Multiselect from "multiselect-react-dropdown";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import dataSarana from "@/components/data/jenisdata.json";

const mockSuggestions = [
  {
    id: "1",
    title: "Perbaikan Jalan Rusak di RT 05",
    description:
      "Jalan di RT 05 mengalami kerusakan parah dengan banyak lubang yang membahayakan pengendara.",
    submitterName: "Ahmad Sudirman",
    submitterEmail: "ahmad.sudirman@email.com",
    submittedDate: "15 Jan 2024",
    status: "pending",
    priority: "high",
  },
  {
    id: "2",
    title: "Pengadaan Taman Bermain Anak",
    description:
      "Usulan pembangunan taman bermain anak di area kosong dekat masjid untuk meningkatkan kualitas hidup warga.",
    submitterName: "Siti Nurhaliza",
    submitterEmail: "siti.nurhaliza@email.com",
    submittedDate: "10 Jan 2024",
    status: "approved",
    priority: "medium",
  },
  {
    id: "3",
    title: "Perbaikan Sistem Drainase",
    description:
      "Sistem drainase di RW 03 sering mampet saat hujan deras menyebabkan banjir di pemukiman.",
    submitterName: "Budi Santoso",
    submitterEmail: "budi.santoso@email.com",
    submittedDate: "8 Jan 2024",
    status: "rejected",
    priority: "high",
  },
  {
    id: "4",
    title: "Pengadaan Lampu Jalan",
    description:
      "Beberapa titik jalan gelap karena lampu rusak, perlu diperbaiki untuk keamanan warga.",
    submitterName: "Maria Goretti",
    submitterEmail: "maria.goretti@email.com",
    submittedDate: "5 Jan 2024",
    status: "pending",
    priority: "medium",
  },
];

const mockCitizens = [
  {
    id: "1",
    name: "Ahmad Sudirman",
    email: "ahmad.sudirman@email.com",
    phone: "081234567890",
    address: "Jl. Merdeka No. 45, RT 05/RW 02",
    registeredDate: "10 Jan 2024",
    totalSubmissions: 3,
    status: "active",
  },
  {
    id: "2",
    name: "Siti Nurhaliza",
    email: "siti.nurhaliza@email.com",
    phone: "082345678901",
    address: "Jl. Sudirman No. 12, RT 03/RW 01",
    registeredDate: "8 Jan 2024",
    totalSubmissions: 2,
    status: "active",
  },
  {
    id: "3",
    name: "Budi Santoso",
    email: "budi.santoso@email.com",
    phone: "083456789012",
    address: "Jl. Pahlawan No. 78, RT 01/RW 03",
    registeredDate: "5 Jan 2024",
    totalSubmissions: 1,
    status: "inactive",
  },
  {
    id: "4",
    name: "Maria Goretti",
    email: "maria.goretti@email.com",
    phone: "084567890123",
    address: "Jl. Pemuda No. 23, RT 02/RW 01",
    registeredDate: "3 Jan 2024",
    totalSubmissions: 4,
    status: "active",
  },
];

export type SukuDinasType = {
  id: string;
  alamat: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  wilayah_administrasi: string;
  nama_kegiatan: string;
  tipe_bahan: string;
  tahun_pelaksanaan: number;
  volume: string;
  satuan: string;
  anggaran: string;
  nama_surveyor: string;
  foto?: string;
  created_at: string;
  updated_at: string;
};

export const AdminDashboard = () => {
  const [suggestions, setSuggestions] = useState(mockSuggestions);
  const [citizens, setCitizens] = useState(mockCitizens);
  const [dataLaporanSukuDinas, setLaporanSukuDinas] = useState<SukuDinasType[]>(
    []
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [cookieStatus, setCookieStatus] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  //untuk form ajukan usulan
  const selectCategory = {};
  const [dataUsulan, setDataSubmitUsulan] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [submissionForm, setSubmissionForm] = useState({
    title: "",
    alamat: "",
    kotaKabupaten: "",
    kelurahan: "",
    rw: "",
    category: [],
    email: userEmail,
    phoneNumber: "",
    agreement: false,
  });

  // Function to check and display cookie status
  const checkCookieStatus = () => {
    const cookies = document.cookie;
    const hasAccessToken = cookies.includes("accessToken");
    const hasRefreshToken = cookies.includes("refreshToken");
    const userData = localStorage.getItem("userData");

    const status = {
      hasAccessToken,
      hasRefreshToken,
      hasUserData: !!userData,
      allCookies: cookies,
      cookieCount: cookies.split(";").length,
      authenticationType:
        hasAccessToken && hasRefreshToken
          ? "Admin Suku Dinas"
          : userData
          ? "User Eksternal"
          : "Akses Public",
    };

    console.log("Cookie Status:", status);
    setCookieStatus(JSON.stringify(status, null, 2));

    toast({
      title: "Status Autentikasi",
      description: `Tipe: ${status.authenticationType} | AccessToken: ${
        hasAccessToken ? "✓" : "✗"
      } | RefreshToken: ${hasRefreshToken ? "✓" : "✗"} | UserData: ${
        userData ? "✓" : "✗"
      }`,
    });
  };

  // Test functions for different authentication states
  const simulateAdminLogin = () => {
    // Simulate admin login with HTTP-only cookies
    document.cookie = "accessToken=test_admin_token; path=/; max-age=86400";
    document.cookie = "refreshToken=test_refresh_token; path=/; max-age=86400";
    localStorage.removeItem("userData");
    toast({
      title: "Simulasi Admin",
      description: "Status admin suku dinas telah disimulasikan",
      className: "bg-blue-500 text-white",
    });
    window.location.reload();
  };

  const simulateExternalUser = () => {
    // Simulate external user with localStorage
    document.cookie =
      "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie =
      "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    localStorage.setItem(
      "userData",
      JSON.stringify({ name: "External User", email: "external@example.com" })
    );
    toast({
      title: "Simulasi Eksternal",
      description: "Status user eksternal telah disimulasikan",
      className: "bg-green-500 text-white",
    });
    window.location.reload();
  };

  const simulatePublicUser = () => {
    // Simulate public user - no authentication
    document.cookie =
      "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie =
      "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    localStorage.removeItem("userData");
    toast({
      title: "Simulasi Public",
      description: "Status akses public telah disimulasikan",
      className: "bg-orange-500 text-white",
    });
    window.location.reload();
  };

  // Test toast function
  const testToast = () => {
    console.log("Test toast triggered");
    toast({
      title: "Test Toast Berhasil!",
      description:
        "Ini adalah test toast untuk memverifikasi sistem toast berfungsi dengan baik",
      variant: "default",
      duration: 5000, // 5 seconds
    });
  };

  // Verify admin authentication on component mount
  useEffect(() => {
    const verifyAdminAuth = async () => {
      try {
        // Test toast to verify toast system is working
        toast({
          title: "Dashboard Loaded",
          description: "Memverifikasi status autentikasi...",
        });

        // Check for different authentication types
        const cookies = document.cookie;
        const hasAccessToken = cookies.includes("accessToken");
        const hasRefreshToken = cookies.includes("refreshToken");
        const userData = localStorage.getItem("userData");
        const adminLogin = localStorage.getItem("admin_login");
        const hasAccessTokenFlag =
          localStorage.getItem("has_access_token") === "true";
        const hasRefreshTokenFlag =
          localStorage.getItem("has_refresh_token") === "true";
        const cookiesVerified = localStorage.getItem("cookies_verified");

        // Use utility function for detailed token logging
        const tokenInfo = logTokenInfo();

        console.log("🔍 Additional Auth Check:");
        console.log("  👤 User data:", { userData: !!userData });
        console.log("  🏠 Admin login flag:", adminLogin === "true");

        // Determine authentication type and show appropriate toast
        if (
          tokenInfo.cookiesInDocument.hasAccessToken &&
          tokenInfo.cookiesInDocument.hasRefreshToken
        ) {
          // Admin suku dinas - HTTP-only cookies present and readable
          console.log("✅ HTTP-only cookies detected and readable");
          console.log("🔵 ALERT: Admin Suku Dinas detected!");
          toast({
            title: "Admin Suku Dinas",
            description: "Login berhasil dengan HTTP-only cookies",
            className: "bg-blue-500 text-white",
          });
        } else if (tokenInfo.hasTokens) {
          // Tokens were received (confirmed by API response)
          console.log("✅ Access & Refresh tokens confirmed from API");
          console.log("🔵 ALERT: Admin with verified tokens detected!");
          toast({
            title: "Admin Dashboard",
            description: "Login berhasil dengan access & refresh tokens",
            className: "bg-blue-500 text-white",
          });

          // Verify admin authentication with API
          const response = await fetch("/admin/profile", {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            // Check if response is actually JSON
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const data = await response.json();
              setAdminData(data.data);
              console.log("Admin authenticated via API:", data.data);
            } else {
              console.warn("Admin profile endpoint returned non-JSON response");
              // For now, set mock admin data since the endpoint might not be implemented
              setAdminData({
                username: localStorage.getItem("admin_username") || "admin",
                role: "admin",
              });
            }
          } else {
            console.log(
              "Admin API not authenticated, status:",
              response.status
            );
            // Check if this is a development environment without backend
            if (response.status === 404) {
              console.log(
                "Admin profile endpoint not found, using local auth data"
              );
              // Use local storage data for development
              const adminUsername = localStorage.getItem("admin_username");

              if (adminLogin === "true" && adminUsername) {
                setAdminData({
                  username: adminUsername,
                  role: "admin",
                });
                console.log("Using local admin authentication");
              } else {
                toast({
                  title: "Akses Ditolak",
                  description: "Silakan login terlebih dahulu",
                  variant: "destructive",
                });
                navigate("/loginAdmin");
                return;
              }
            } else {
              toast({
                title: "Akses Ditolak",
                description: "Silakan login terlebih dahulu",
                variant: "destructive",
              });
              navigate("/loginAdmin");
              return;
            }
          }
        } else if (adminLogin === "true") {
          // Admin login via localStorage only (fallback or development mode)
          console.log("Showing admin localStorage toast");
          console.log("🔵 ALERT: Admin LocalStorage detected!");
          toast({
            title: "Admin Dashboard",
            description: "Anda login sebagai admin (development mode)",
            className: "bg-blue-500 text-white",
          });

          // Use localStorage data directly
          const adminUsername = localStorage.getItem("admin_username");
          if (adminUsername) {
            setAdminData({
              username: adminUsername,
              role: "admin",
            });
            console.log("Using localStorage admin data:", adminUsername);
          } else {
            toast({
              title: "Akses Ditolak",
              description: "Data admin tidak ditemukan",
              variant: "destructive",
            });
            navigate("/loginAdmin");
            return;
          }
        } else if (userData) {
          // Eksternal user - localStorage userData present
          console.log("Showing external user toast");
          console.log("🟢 ALERT: User Eksternal detected!");
          toast({
            title: "User Eksternal",
            description: "Anda login sebagai user eksternal",
            className: "bg-green-500 text-white",
          });

          // For external users, we don't need to verify with admin API
          setAdminData({ username: "external_user", role: "external" });
        } else {
          // Public user - no authentication
          console.log("Showing public user toast");
          console.log("🟠 ALERT: Akses Public detected!");
          toast({
            title: "Akses Public",
            description: "Anda mengakses sebagai user public",
            className: "bg-orange-500 text-white",
          });

          // For public users, we don't need to verify with admin API
          setAdminData({ username: "public_user", role: "public" });
        }
      } catch (error) {
        console.error("Auth verification error:", error);
        toast({
          title: "Error Verifikasi",
          description: "Terjadi kesalahan saat verifikasi autentikasi",
          variant: "destructive",
        });
        navigate("/loginAdmin");
        return;
      } finally {
        setIsLoading(false);
      }
    };

    // Show test toast after a delay
    const testToastTimer = setTimeout(() => {
      console.log("Component mounted, showing test toast");
      toast({
        title: "🚀 Toast System Test",
        description:
          "Jika Anda melihat toast ini, sistem toast berfungsi dengan baik!",
        duration: 10000, // 10 seconds
      });
    }, 500);

    verifyAdminAuth();

    // Cleanup timer
    return () => {
      clearTimeout(testToastTimer);
    };
  }, [navigate, toast]);

  const handleApprove = (id: string) => {
    setSuggestions((prev) =>
      prev.map((suggestion) =>
        suggestion.id === id
          ? { ...suggestion, status: "approved" }
          : suggestion
      )
    );
    toast({
      title: "Pengajuan Disetujui",
      description: "Pengajuan telah berhasil disetujui",
    });
  };

  const handleReject = (id: string) => {
    setSuggestions((prev) =>
      prev.map((suggestion) =>
        suggestion.id === id
          ? { ...suggestion, status: "rejected" }
          : suggestion
      )
    );
    toast({
      title: "Pengajuan Ditolak",
      description: "Pengajuan telah ditolak",
      variant: "destructive",
    });
  };

  const handleCitizenStatusToggle = (id: string) => {
    setCitizens((prev) =>
      prev.map((citizen) =>
        citizen.id === id
          ? {
              ...citizen,
              status: citizen.status === "active" ? "inactive" : "active",
            }
          : citizen
      )
    );
    toast({
      title: "Status Warga Diperbarui",
      description: "Status warga berhasil diubah",
    });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      // Call proxy server logout endpoint
      const response = await fetch("/admin/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
      });

      if (response.ok) {
        console.log("Admin logout successful");
        toast({
          title: "Logout Berhasil",
          description: "Anda telah keluar dari sistem admin",
        });
      } else {
        console.log("Admin logout failed:", response.status);
        toast({
          title: "Logout Warning",
          description: "Logout gagal, tetapi session lokal telah dibersihkan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Admin logout error:", error);
      toast({
        title: "Logout Warning",
        description:
          "Terjadi kesalahan saat logout, tetapi session lokal telah dibersihkan",
        variant: "destructive",
      });
    }

    // Clear all localStorage and cookies
    localStorage.clear();
    document.cookie =
      "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie =
      "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie =
      "admin_login=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie =
      "admin_login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

    // Redirect to login page
    navigate("/loginAdmin");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-accent text-accent-foreground">Disetujui</Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>;
      case "pending":
        return <Badge variant="secondary">Menunggu</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Tinggi</Badge>;
      case "medium":
        return <Badge className="bg-amber-500 text-white">Sedang</Badge>;
      case "low":
        return <Badge variant="outline">Rendah</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const stats = {
    totalSuggestions: suggestions.length,
    pendingSuggestions: suggestions.filter((s) => s.status === "pending")
      .length,
    approvedSuggestions: suggestions.filter((s) => s.status === "approved")
      .length,
    rejectedSuggestions: suggestions.filter((s) => s.status === "rejected")
      .length,
    totalCitizens: citizens.length,
    activeCitizens: citizens.filter((c) => c.status === "active").length,
  };

  // Read coordinates from localStorage and show modal if exists ()
  useEffect(() => {
    const storedCoordinates = localStorage.getItem("coordinates");
    if (storedCoordinates) {
      try {
        const coordData = JSON.parse(storedCoordinates);
        //default lat lng -6.175628, 106.827368
        setCoordinates(coordData ?? { lat: "-6.175628", lng: "106.827368" });
      } catch (error) {
        console.error("Error parsing coordinates from localStorage:", error);
      }
    }

    fetchDataSukuDinas();
  }, []);

  const fetchDataSukuDinas = async () => {
    try {
      const res = await fetch(`/api/suku-dinas`);
      const data = await res.json();
      if (data) {
        setLaporanSukuDinas(data?.data);
      } else {
        console.error("Gagal mengambil data");
      }
      console.log("isi data sukudinas->", data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    }
  };

  const clickTab = () => {
    fetchDataSukuDinas();
  }

  //for handle submit form ajukan saran
  const handleNewSubmission = () => {
    setIsModalOpen(true);
  };

  //for handle select data kategori on form ajukan saran
  const onSelect = (selectedList, selectedItem) => {};
  const onRemove = (selectedList, removedItem) => {};

  //for handle submit form ajukan saran
  const handleSubmitForm = () => {
    if (
      !submissionForm.title ||
      !submissionForm.kotaKabupaten ||
      !submissionForm.alamat ||
      !submissionForm.kelurahan ||
      !submissionForm.rw
    ) {
      toast({
        title: "Formulir Tidak Lengkap",
        description: "Mohon cek kembali formulir pengajuan",
        variant: "destructive",
      });
      return;
    } else {
      const submit = {
        id: (dataUsulan.length + 1).toString(),
        title: submissionForm.title,
        submittedDate: "15 Jan 2025",
        steps: [
          {
            id: "1",
            title: "Pengajuan Diterima",
            description:
              "Saran Anda telah berhasil dikirim dan diterima oleh sistem",
            status: "completed",
            date: "10 Jan 2024",
          },
          {
            id: "2",
            title: "Verifikasi Data",
            description:
              "Tim verifikasi sedang memeriksa kelengkapan dan validitas pengajuan",
            status: "active",
            date: "",
          },
          {
            id: "3",
            title: "Review oleh Admin",
            description:
              "Admin sedang melakukan review mendalam terhadap pengajuan Anda",
            status: "pending",
            date: "",
          },
          {
            id: "4",
            title: "Rekomendasi",
            description: "Usulan akan diajukan untuk dianggarkan",
            status: "pending",
            date: "",
          },
        ],
      };

      setDataSubmitUsulan((prev) => [...prev, submit]);
    }

    // Simulate API call
    toast({
      title: "Pengajuan Berhasil",
      description: "Saran Anda telah berhasil dikirim dan sedang diproses",
    });

    // Clear form and close modal
    setSubmissionForm({
      title: "",
      alamat: "",
      kotaKabupaten: "",
      kelurahan: "",
      rw: "",
      category: [],
      email: userEmail,
      phoneNumber: "",
      agreement: false,
    });
    setIsModalOpen(false);
  };

  const rupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(number);
  };

  // Show loading state while verifying authentication
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Memverifikasi autentikasi...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard Admin
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola pengajuan saran dan data warga
            </p>
            {adminData && (
              <div className="mt-2 flex items-center gap-2">
                <Badge className="bg-green-500 text-white">
                  Login sebagai: {adminData.username}
                </Badge>
                {document.cookie.includes("accessToken") &&
                  document.cookie.includes("refreshToken") && (
                    <Badge className="bg-blue-500 text-white">
                      Admin Suku Dinas
                    </Badge>
                  )}
                {localStorage.getItem("userData") &&
                  !document.cookie.includes("accessToken") && (
                    <Badge className="bg-green-500 text-white">
                      User Eksternal
                    </Badge>
                  )}
                {!localStorage.getItem("userData") &&
                  !document.cookie.includes("accessToken") && (
                    <Badge className="bg-orange-500 text-white">
                      Akses Public
                    </Badge>
                  )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {/* <Button variant="outline" onClick={checkCookieStatus} size="sm">
              Check Cookies
            </Button> */}
            <Button
              variant="outline"
              onClick={simulateAdminLogin}
              size="sm"
              className="bg-blue-500 text-white"
            >
              Simulasi Admin
            </Button>
            <Button
              variant="outline"
              onClick={simulateExternalUser}
              size="sm"
              className="bg-green-500 text-white"
            >
              Simulasi Eksternal
            </Button>
            {/* <Button variant="outline" onClick={simulatePublicUser} size="sm" className="bg-orange-500 text-white">
              Simulasi Public
            </Button>
            <Button variant="outline" onClick={testToast} size="sm" className="bg-purple-500 text-white">
              Test Toast
            </Button> */}
            <Button
              variant="outline"
              onClick={handleNewSubmission}
              size="sm"
              className="bg-green-500 text-white"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Ajukan saran baru
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                window.open("/gis-fe", "_blank");
              }}
              size="sm"
              className="bg-blue-500 text-white"
            >
              Peta Sigap Kumuh
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                window.open("/portal", "_blank");
              }}
              size="sm"
              className="bg-blue-500 text-white"
            >
              Portal Dashboard Data
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-primary text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {stats.totalSuggestions}
                  </div>
                  <div className="text-sm opacity-90">Total Pengajuan</div>
                </div>
                <FileText className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {stats.pendingSuggestions}
                  </div>
                  <div className="text-sm opacity-90">Menunggu Review</div>
                </div>
                <Clock className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-accent text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {stats.approvedSuggestions}
                  </div>
                  <div className="text-sm opacity-90">Disetujui</div>
                </div>
                <CheckCircle className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-civic-blue text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {stats.activeCitizens}
                  </div>
                  <div className="text-sm opacity-90">Warga Aktif</div>
                </div>
                <Users className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cookie Status Debug (only show if there's cookie status) */}
        {cookieStatus && (
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm">Debug: Cookie Status</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                {cookieStatus}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="suggestions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-fit">
            <TabsTrigger value="suggestions">Pengajuan Saran</TabsTrigger>
            <TabsTrigger value="citizens">Data Warga</TabsTrigger>
            <TabsTrigger value="sukudinas" onClick={clickTab}>Laporan Suku Dinas</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-6">
            <div className="grid gap-6">
              {suggestions.map((suggestion) => (
                <Card
                  key={suggestion.id}
                  className="shadow-card hover:shadow-elegant transition-all duration-200"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-foreground">
                          {suggestion.title}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {suggestion.description}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        {getStatusBadge(suggestion.status)}
                        {getPriorityBadge(suggestion.priority)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="w-4 h-4 mr-2" />
                          <span>{suggestion.submitterName}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="w-4 h-4 mr-2" />
                          <span>{suggestion.submitterEmail}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{suggestion.submittedDate}</span>
                        </div>
                      </div>

                      {suggestion.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApprove(suggestion.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Setujui
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(suggestion.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Tolak
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="citizens" className="space-y-6">
            <div className="grid gap-6">
              {citizens.map((citizen) => (
                <Card
                  key={citizen.id}
                  className="shadow-card hover:shadow-elegant transition-all duration-200"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-foreground">
                          {citizen.name}
                        </CardTitle>
                        <CardDescription>
                          Terdaftar sejak {citizen.registeredDate} •{" "}
                          {citizen.totalSubmissions} pengajuan
                        </CardDescription>
                      </div>
                      <Badge
                        className={
                          citizen.status === "active"
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {citizen.status === "active" ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="w-4 h-4 mr-2" />
                          <span>{citizen.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>{citizen.phone}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{citizen.address}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          <span>
                            {citizen.totalSubmissions} pengajuan diajukan
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCitizenStatusToggle(citizen.id)}
                      >
                        {citizen.status === "active"
                          ? "Nonaktifkan"
                          : "Aktifkan"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sukudinas" className="space-y-6">
            <div className="grid gap-6">
              {dataLaporanSukuDinas && dataLaporanSukuDinas.length > 0 ? (
                <>
                  {dataLaporanSukuDinas.map((sudin) => (
                    <Card
                      key={sudin.id}
                      className="shadow-card hover:shadow-elegant transition-all duration-200"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg text-foreground">
                              {sudin?.nama_kegiatan.toLocaleUpperCase() ?? "-"}
                            </CardTitle>
                            <CardDescription>
                              Tahun Pelaksanaan: {sudin?.tahun_pelaksanaan}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span>Nama Surveyor: &nbsp;</span>
                              <span>{sudin.nama_surveyor ?? "-"}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span>Anggaran: &nbsp;</span>
                              <span>{rupiah(sudin.anggaran) ?? "0"}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span>Alamat: &nbsp;</span>
                              <span>{sudin?.alamat ?? "-"}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span>Wilayah Administrasi: &nbsp;</span>
                              <span>{sudin?.wilayah_administrasi ?? "-"}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span>Kelurahan: &nbsp;</span>
                              <span>{sudin?.kelurahan ?? "-"}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span>Kecamatan: &nbsp;</span>
                              <span>{sudin?.kecamatan ?? "-"}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span>RW: &nbsp;</span>
                              <span>{sudin?.rw ?? "-"}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span>Tipe Bahan: &nbsp;</span>
                              <span>{sudin.tipe_bahan}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span>Volume: &nbsp;</span>
                              <span>{sudin.volume}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span>Satuan: &nbsp;</span>
                              <span>{sudin.satuan}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <div>Data Tidak Tersedia</div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal Form untuk Pengajuan Baru */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Ajukan Saran Baru</DialogTitle>
              <DialogDescription>
                Isi formulir di bawah untuk mengajukan saran atau keluhan
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Koordinat Lokasi */}
              {coordinates && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Navigation className="w-4 h-4" />
                    <span className="font-medium">Lokasi Terdeteksi</span>
                  </div>
                  <div className="text-sm text-blue-600">
                    Latitude: {coordinates.lat.toFixed(6)}, Longitude:{" "}
                    {coordinates.lng.toFixed(6)}
                  </div>
                </div>
              )}

              <div>
                <MapContainer
                  center={[-6.2058872, 106.8336268]}
                  zoom={12}
                  style={{ height: "40vh" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[-6.18094, 106.798808]}></Marker>
                </MapContainer>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <InputField
                    label="Judul Pengajuan"
                    id="title"
                    type="text"
                    value={submissionForm.title}
                    onChange={(e) =>
                      setSubmissionForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Contoh: Perbaikan Jalan Rusak di RT 05"
                    required
                    className="border-[#ccc]"
                  />
                </div>
                <div>
                  <Label htmlFor="alamat">Alamat</Label>
                  <Textarea
                    id="alamat"
                    value={submissionForm.alamat}
                    onChange={(e) =>
                      setSubmissionForm((prev) => ({
                        ...prev,
                        alamat: e.target.value,
                      }))
                    }
                    placeholder="Contoh: Jl. Perumahan blok A1 No. 12345 RW 123, Jakarta Pusat, Gambir, 12345"
                    rows={4}
                    className="border-[#ccc]"
                    required
                  />
                </div>
                <div>
                  <InputField
                    label="Kota/Kabupaten"
                    id="kotaKabupaten"
                    type="text"
                    value={submissionForm.kotaKabupaten}
                    onChange={(e) =>
                      setSubmissionForm((prev) => ({
                        ...prev,
                        kotaKabupaten: e.target.value,
                      }))
                    }
                    placeholder="Contoh: Jakarta Pusat"
                    required
                    className="border-[#ccc]"
                  />
                </div>
                <div>
                  <InputField
                    label="Kelurahan"
                    id="kelurahan"
                    type="text"
                    value={submissionForm.kelurahan}
                    onChange={(e) =>
                      setSubmissionForm((prev) => ({
                        ...prev,
                        kelurahan: e.target.value,
                      }))
                    }
                    placeholder="Contoh: Gambir"
                    required
                    className="border-[#ccc]"
                  />
                </div>
                <div>
                  <InputField
                    label="RW"
                    id="rw"
                    type="text"
                    value={submissionForm.rw}
                    onChange={(e) =>
                      setSubmissionForm((prev) => ({
                        ...prev,
                        rw: e.target.value,
                      }))
                    }
                    placeholder="Contoh: 6"
                    required
                    className="border-[#ccc]"
                  />
                </div>
                <div>
                  <Label>Kategori</Label>
                  <div className="mt-2">
                    <Multiselect
                      displayValue="key"
                      groupBy="cat"
                      selectedValues={selectCategory}
                      onKeyPressFn={function noRefCheck() {}}
                      onRemove={onRemove}
                      onSearch={function noRefCheck() {}}
                      onSelect={onSelect}
                      options={dataSarana}
                      showCheckbox
                      placeholder=""
                    />
                  </div>
                </div>
                <div className="flex">
                  <Checkbox
                    className="mt-1"
                    checked={submissionForm.agreement}
                    onCheckedChange={(e) =>
                      setSubmissionForm((prev) => ({
                        ...prev,
                        agreement: !submissionForm.agreement,
                      }))
                    }
                  />
                  <div className="ml-2">
                    Saya setuju dan bersedia untuk dihubungi lebih lanjut
                    terkait usulan yang diajukan.
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  className="hov"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSubmitForm}
                  variant="default"
                  disabled={
                    submissionForm.title === "" ||
                    submissionForm.alamat === "" ||
                    submissionForm.kotaKabupaten === "" ||
                    submissionForm.kelurahan === "" ||
                    submissionForm.rw === "" ||
                    !submissionForm.agreement
                  }
                >
                  Kirim Pengajuan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};
