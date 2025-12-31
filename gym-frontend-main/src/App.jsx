import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { useState, useEffect } from "react";
import * as echarts from "echarts";

import Navbar from "./Layout/Navbar";
import Login from "./Auth/Login";
import Signup from "./Auth/Signup";
import ForgotPassword from "./Auth/ForgotPassword";
import Sidebar from "./Layout/Sidebar";
import ProtectedRoute from "./Components/ProtectedRoute";
import ErrorBoundary from "./Components/ErrorBoundary";
// import DepartmentOKRs from "./Component/Okrs-management/Departement/DepartmentOKRs";
import AdminDashbaord from "./Dashboard/Admin/AdminDashbaord";
import MemberManagement from "./Dashboard/Manager/MemberManagement";
import StaffManagement from "./Dashboard//Manager/StaffManagement";
import ClassScheduling from "./Dashboard/Manager/ClassScheduling";
import Reports from "./Dashboard/Manager/Reports";
import Communication from "./Dashboard/Manager/Communication";
import Dashboard from "./Dashboard/Manager/Dashboard";



import Campaigns from "./Dashboard/Admin/Marketing/Campaigns";
import SuperAdminBranches from "./Dashboard/Admin/SuperAdminBranches";
import EmailsSms from "./Dashboard/Admin/Marketing/EmailsSms";
import ManageMembers from "./Dashboard/Admin/Members/ManageMembers";
import QrCodeAttendance from "./Dashboard/Admin/Members/QrCodeAttendance";
import WalkInRegistration from "./Dashboard/Admin/Members/WalkInRegistration";
import Membership from "./Dashboard/Admin/Payments/Membership";

import SalesReport from "./Dashboard/Admin/Reports/SalesReport";
import ManageStaff from "./Dashboard/Admin/Staff/ManageStaff";
import RolesPermissions from "./Dashboard/Admin/Staff/RolesPermissions";
import StaffAttendance from "./Dashboard/Admin/Staff/StaffAttendance";
import DutyRoster from "./Dashboard/Admin/Staff/DutyRoster";
import SalaryCalculator from "./Dashboard/Admin/Staff/SalaryCalculator";
import HouseKeepingDashboard from "./Dashboard/HouseKeeping/HouseKeepingDashboard";
import GeneralTrainerDashboard from "./Dashboard/GeneralTrainer/GeneralTrainerDashboard";
import GeneralQrCheckin from "./Dashboard/GeneralTrainer/GeneralQrCheckin";
import MemberDashboard from "./Dashboard/Member/MemberDashboard";
import Account from "./Dashboard/Member/Account";
// import MemberBooking from "./Dashboard/Member/MemberBooking";
import MemberQrCheckin from "./Dashboard/Member/MemberQrCheckin";
import ClassSchedule from "./Dashboard/Member/ClassSchedule";
import Report from "./Dashboard/GeneralTrainer/Report"

import AttendanceHistory from "./Dashboard/Member/AttendanceHistory";

import ReceptionistDashboard from "./Dashboard/Receptionist/ReceptionistDashboard";


// import PersonalTrainerAssignedMembers from "./Dashboard/PersonalTrainer/PersonalTrainerAssignedMembers";

import PersonalTrainerMessages from "./Dashboard/PersonalTrainer/PersonalTrainerMessages";
import PersonalTrainerGroupClasses from "./Dashboard/PersonalTrainer/PersonalTrainerGroupClasses";

import PersonalTrainerDashboard from "./Dashboard/PersonalTrainer/PersonalTrainerDashboard";
import PersonalTrainerQrCheckin from "./Dashboard/PersonalTrainer/PersonsalTrainerQrCheckin"

import Attendance from "./Dashboard/GeneralTrainer/Attendance";
// import MemberInteraction from "./Dashboard/GeneralTrainer/MemberInteraction";
import DailyScedule from "./Dashboard/GeneralTrainer/DailyScedule";

import HouseKeepingDutyRoster from "./Dashboard/HouseKeeping/HouseKeepingDutyRoster";
import HouseKeepingAttendance from "./Dashboard/HouseKeeping/HouseKeepingAttendance";
import HouseKeepingTaskChecklist from "./Dashboard/HouseKeeping/HouseKeepingTaskChecklist";
import HouseKeepingNotifications from "./Dashboard/HouseKeeping/HouseKeepingNotifications";
import HouseKeepingQrCheckin from "./Dashboard/HouseKeeping/HouseKeepingQrCheckin";
// import HouseKeepingDutyRosters from "./Dashboard/HouseKeeping/HouseKeepingQDutyRoster";
import ReceptionistWalkinMember from "./Dashboard/Receptionist/ReceptionistWalkinMember"
import ReceptionistMembershipSignups from "./Dashboard/Receptionist/ReceptionistMembershipSignups";
import HousekeepingShiftView from "./Dashboard/HouseKeeping/HousekeepingShiftView";
import HousekeepingTask from "./Dashboard/HouseKeeping/HousekeepingTask";

import ReceptionistQrCheckin from "./Dashboard/Receptionist/ReceptionistQrCheckin";
import ReceptionistQRCode from "./Dashboard/Receptionist/ReceptionistQRCode";
import ReceptionistPaymentCollection from "./Dashboard/Receptionist/ReceptionistPaymentCollection"
import ReceptionistBookGroupClasses from "./Dashboard/Receptionist/ReceptionistBookGroupClasses"
import BranchManagement from "./Dashboard/Admin/Settings/BranchManagement";
import RoleManagement from "./Dashboard/Admin/Settings/RoleManagement";




import SuperAdminOwner from "./Dashboard/SuperAdmin/SuperAdminAdmin";
import Plans from "./Dashboard/SuperAdmin/Plans";
// import Marketing from "./Dashboard/SuperAdmin/Marketing";
// import Staff from "./Dashboard/SuperAdmin/People/Staff";
// import Members from "./Dashboard/SuperAdmin/People/Members";
// import Invoices from "./Dashboard/SuperAdmin/Payments/Invoices";
import Payments from "./Dashboard/SuperAdmin/Payments";
// import Request from "./Dashboard/SuperAdmin/Request";
import Request from "./Dashboard/SuperAdmin/Requestplan";






// import RazorpayReports from "./Dashboard/SuperAdmin/Payments/RazorpayReports";
// import SalesReports from "./Dashboard/SuperAdmin/Reports/SalesReports";
// import MembershipReports from "./Dashboard/SuperAdmin/Reports/Membershipreports";
// import AttendanceReports from "./Dashboard/SuperAdmin/Reports/AttendanceReports";
import Groups from "./Dashboard/Admin/Groups";
import ClassesSchedule from "./Dashboard/Admin/ClassesSchedule";
import AttendanceReport from "./Dashboard/Admin/Reports/AttendanceReport";
import LendingPage from "./Website/LendingPage";
import PersonalTrainerSessionBookings from "./Dashboard/Admin/Bookings/PersonalTrainerSessionBookings";
import CreatePlan from "./Dashboard/Admin/CreatePlan";
import ViewPlan from "./Dashboard/Member/ViewPlan";
import PersonalPlansBookings from "./Dashboard/PersonalTrainer/PersonalPlansBookings";
import GroupPlansBookings from "./Dashboard/GeneralTrainer/GroupPlansBookings";

// new import 
import AdminMember from "./Dashboard/Admin/AdminMember";
import PersonalTraining from "./Dashboard/Admin/Bookings/PersonalTraining";
import QrCheckin from "./Dashboard/Admin/qrcheckin";
import Setting from "./Dashboard/SuperAdmin/Setting";
import DashboardHomePage from "./Dashboard/SuperAdmin/SuperAdminDashbaord";
import ShiftManagement from "./Dashboard/Admin/ShiftMangamenet";
import AdminTaskManagement from "./Dashboard/Admin/AdminTaskManagement";
import PersonalAttendance from "./Dashboard/PersonalTrainer/PersonalAttendance";
import AdminSetting from "./Dashboard/Admin/AdminSetting";
import DynamicPage from "./Layout/DynamicPage";
import RequestPlan from "./Dashboard/Member/RequestsPlan";
import PersonalTrainerClassesSchedule from "./Dashboard/PersonalTrainer/PersonalTrainerClassesSchedule";
import GeneralClassesSchedule from "./Dashboard/GeneralTrainer/GeneralClassesSchedule";
import PersonalSessionBooking from "./Dashboard/PersonalTrainer/PersonalSessionBooking";
import GeneralSessionBooking from "./Dashboard/GeneralTrainer/GeneralSessionBooking";
import PersonsalTrainerShiftManagement from "./Dashboard/PersonalTrainer/PersonsalTrainerShiftManagement";
import GeneralTrainerShiftManagement from "./Dashboard/GeneralTrainer/GeneralTrainerShiftManagement";
import HouseKeepingShiftManagement from "./Dashboard/HouseKeeping/HouseKeepingShiftManagement";
import MemberAttendance from "./Dashboard/Member/MemberAttendance";
import ReportsAttendance from "./Dashboard/Receptionist/ReportsAttendance";
import ReportsClasses from "./Dashboard/Receptionist/ReportsClasses";
import PersonsalReportsClasses from "./Dashboard/PersonalTrainer/PersonsalReportsClasses";
import ReceptionistHouseKeepingAttendanceCheckOut from "./Dashboard/Receptionist/ReceptionistHouseKeepingAttendanceCheckOut";
import MemberAllPlans from "./Dashboard/Member/MemberAllPlans";




function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => window.innerWidth <= 768;
    if (checkIfMobile()) {
      setIsSidebarCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const location = useLocation();

  const isDynamicPage =
    /^\/[^\/]+\/\d+$/.test(location.pathname) ||  // /gym/90
    /^\/\d+$/.test(location.pathname);             // /90

  const hideLayout =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgot-password" ||
    isDynamicPage;



  return (
    <>
      <Routes>
        <Route path=":slug?/:adminId" element={<DynamicPage />} />
      </Routes>
      {hideLayout ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<LendingPage />} />

        </Routes>
      ) : (
        <>
          <Navbar toggleSidebar={toggleSidebar} />
          <div className="main-content">
            <Sidebar
              collapsed={isSidebarCollapsed}
              setCollapsed={setIsSidebarCollapsed}
            />
            <div
              className={`right-side-content ${isSidebarCollapsed ? "collapsed" : ""
                }`}
            >
              <ErrorBoundary>
                <Routes>

                  <Route path="/superadmin/dashboard" element={<ProtectedRoute allowedRoles="SUPERADMIN"><DashboardHomePage /></ProtectedRoute>} />
                  <Route path="/superadmin/Admin" element={<ProtectedRoute allowedRoles="SUPERADMIN"><SuperAdminOwner /></ProtectedRoute>} />
                  <Route path="/superadmin/Plans&Pricing" element={<ProtectedRoute allowedRoles="SUPERADMIN"><Plans /></ProtectedRoute>} />
                  <Route path="superadmin/payments" element={<ProtectedRoute allowedRoles="SUPERADMIN"><Payments /></ProtectedRoute>} />
                  <Route path="/superadmin/setting" element={<ProtectedRoute allowedRoles="SUPERADMIN"><Setting /></ProtectedRoute>} />
                  <Route path="/superadmin/request-plan" element={<ProtectedRoute allowedRoles="SUPERADMIN"><Request /></ProtectedRoute>} />
                  <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><AdminDashbaord /></ProtectedRoute>} />
                  <Route path="admin/admindashboard" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><AdminDashbaord /></ProtectedRoute>} />
                  <Route path="admin/group" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><Groups /></ProtectedRoute>} />
                  <Route path="admin/CreatePlan" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><CreatePlan /></ProtectedRoute>} />

                  {/* admin dahsboard */}
                  <Route path="admin/admin-dashboard" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><AdminDashbaord /></ProtectedRoute>} />
                  <Route path="/admin/qrcheckin" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><QrCheckin /></ProtectedRoute>} />
                  <Route path="admin/AdminMember" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><AdminMember /></ProtectedRoute>} />

                  {/* booking */}
                  <Route path="/admin/booking/attendance" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><AttendanceReport /></ProtectedRoute>} />
                  <Route path="/admin/booking/personal-training" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><PersonalTraining /></ProtectedRoute>} />
                  <Route path="/admin/AdminBranches" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><SuperAdminBranches /></ProtectedRoute>} />
                  <Route path="/admin/ClassesSchedule" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><ClassesSchedule /></ProtectedRoute>} />
                  <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><PersonalTrainerSessionBookings /></ProtectedRoute>} />

                  {/* Marketibg */}
                  <Route path="marketing/campaigns" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><Campaigns /></ProtectedRoute>} />
                  <Route path="marketing/email-sms" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><EmailsSms /></ProtectedRoute>} />

                  {/* Members */}
                  <Route path="/admin/members/manage-members" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><ManageMembers /></ProtectedRoute>} />
                  <Route path="/admin/members/qr-code-attendance" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN", "RECEPTIONIST"]}><QrCodeAttendance /></ProtectedRoute>} />
                  <Route path="/admin/members/walk-in-registration" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN", "RECEPTIONIST"]}><WalkInRegistration /></ProtectedRoute>} />

                  {/* Payments Routes */}
                  <Route path="/admin/payments/membership" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><Membership /></ProtectedRoute>} />

                  {/* Reports  */}
                  <Route path="/admin/reports/sales" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN", "MANAGER"]}><SalesReport /></ProtectedRoute>} />
                  <Route path="/admin/reports/AttendanceReport" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN", "MANAGER"]}><AttendanceReport /></ProtectedRoute>} />

                  {/* Staff Routes */}
                  <Route path="/admin/staff/manage-staff" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><ManageStaff /></ProtectedRoute>} />
                  <Route path="/admin/staff/roles-permissions" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><RolesPermissions /></ProtectedRoute>} />
                  <Route path="/admin/staff/attendance" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><StaffAttendance /></ProtectedRoute>} />
                  <Route path="/admin/staff/duty-roster" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><DutyRoster /></ProtectedRoute>} />
                  <Route path="/admin/staff/salary-calculator" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><SalaryCalculator /></ProtectedRoute>} />
                  <Route path="/admin/shift-managment" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><ShiftManagement /></ProtectedRoute>} />
                  <Route path="/admin/task-managment" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><AdminTaskManagement /></ProtectedRoute>} />
                  {/* setting routes */}
                  <Route path="/admin/settings/BranchManagement" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><BranchManagement /></ProtectedRoute>} />
                  <Route path="/admin/settings/RoleManagement" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><RoleManagement /></ProtectedRoute>} />
                  <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><AdminSetting /></ProtectedRoute>} />

                  {/* admin dahsboard end */}

                  {/* Manager Dashbaord */}
                  <Route path="/manager/dashboard" element={<ProtectedRoute allowedRoles={["MANAGER", "ADMIN", "SUPERADMIN"]}><Dashboard /></ProtectedRoute>} />
                  <Route path="/manager/members" element={<ProtectedRoute allowedRoles={["MANAGER", "ADMIN", "SUPERADMIN"]}><MemberManagement /></ProtectedRoute>} />
                  {/* <Route path="/manager/membership-plan" element={<MembershipPlans />} /> */}
                  <Route path="/manager/duty-roster" element={<ProtectedRoute allowedRoles={["MANAGER", "ADMIN", "SUPERADMIN"]}><StaffManagement /></ProtectedRoute>} />
                  <Route path="/manager/class-schedule" element={<ProtectedRoute allowedRoles={["MANAGER", "ADMIN", "SUPERADMIN"]}><ClassScheduling /></ProtectedRoute>} />
                  <Route path="/manager/reports" element={<ProtectedRoute allowedRoles={["MANAGER", "ADMIN", "SUPERADMIN"]}><Reports /></ProtectedRoute>} />
                  <Route path="/manager/communication" element={<ProtectedRoute allowedRoles={["MANAGER", "ADMIN", "SUPERADMIN"]}><Communication /></ProtectedRoute>} />
                  <Route path="/housekeeping/dashboard" element={<ProtectedRoute allowedRoles={["HOUSEKEEPING", "ADMIN", "SUPERADMIN"]}><HouseKeepingDashboard /></ProtectedRoute>} />

                  <Route path="/generaltrainer/dashboard" element={<ProtectedRoute allowedRoles={["GENERALTRAINER", "ADMIN", "SUPERADMIN"]}><GeneralTrainerDashboard /></ProtectedRoute>} />
                  <Route path="/generaltrainer/classesschedule" element={<ProtectedRoute allowedRoles={["GENERALTRAINER", "ADMIN", "SUPERADMIN"]}><GeneralClassesSchedule /></ProtectedRoute>} />
                  <Route path="/generaltrainer/bookings" element={<ProtectedRoute allowedRoles={["GENERALTRAINER", "ADMIN", "SUPERADMIN"]}><GeneralSessionBooking /></ProtectedRoute>} />
                  <Route path="/GeneralTrainer/attendance" element={<ProtectedRoute allowedRoles={["GENERALTRAINER", "ADMIN", "SUPERADMIN"]}><Attendance /></ProtectedRoute>} />
                  <Route path="/GeneralTrainer/shift-managment" element={<ProtectedRoute allowedRoles={["GENERALTRAINER", "ADMIN", "SUPERADMIN"]}><GeneralTrainerShiftManagement /></ProtectedRoute>} />
                  {/* <Route path="/GeneralTrainer/MemberInteraction" element={<MemberInteraction />} /> */}
                  <Route path="/GeneralTrainer/qrcheckin" element={<ProtectedRoute allowedRoles={["GENERALTRAINER", "ADMIN", "SUPERADMIN"]}><GeneralQrCheckin /></ProtectedRoute>} />
                  <Route path="/GeneralTrainer/Reports" element={<ProtectedRoute allowedRoles={["GENERALTRAINER", "ADMIN", "SUPERADMIN"]}><Report /></ProtectedRoute>} />
                  <Route path="/GeneralTrainer/DailyScedule" element={<ProtectedRoute allowedRoles={["GENERALTRAINER", "ADMIN", "SUPERADMIN"]}><DailyScedule /></ProtectedRoute>} />
                  <Route path="/GeneralTrainer/GroupPlansBookings" element={<ProtectedRoute allowedRoles={["GENERALTRAINER", "ADMIN", "SUPERADMIN"]}><GroupPlansBookings /></ProtectedRoute>} />

                  <Route path="/member/dashboard" element={<ProtectedRoute allowedRoles={["MEMBER", "ADMIN"]}><MemberDashboard /></ProtectedRoute>} />
                  <Route path="/member/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                  <Route path="/member/classschedule" element={<ProtectedRoute allowedRoles={["MEMBER", "ADMIN"]}><ClassSchedule /></ProtectedRoute>} />
                  <Route path="/member/attendance-history" element={<ProtectedRoute allowedRoles={["MEMBER", "ADMIN"]}><AttendanceHistory /></ProtectedRoute>} />
                  <Route path="/member/qrcheckin" element={<ProtectedRoute allowedRoles={["MEMBER", "ADMIN"]}><MemberQrCheckin /></ProtectedRoute>} />
                  <Route path="/member/memberattendance" element={<ProtectedRoute allowedRoles={["MEMBER", "ADMIN"]}><MemberAttendance /></ProtectedRoute>} />
                  <Route path="/member/viewplan" element={<ProtectedRoute allowedRoles={["MEMBER", "ADMIN"]}><ViewPlan /></ProtectedRoute>} />
                  <Route path="/member/requestplan" element={<ProtectedRoute allowedRoles={["MEMBER", "ADMIN"]}><RequestPlan /></ProtectedRoute>} />
                  <Route path="/member/allplans" element={<ProtectedRoute allowedRoles={["MEMBER", "ADMIN"]}><MemberAllPlans /></ProtectedRoute>} />
                  {/* <Route path="/member/memberbooking" element={<MemberBooking />} /> */}
                  <Route path="/receptionist/dashboard" element={<ProtectedRoute allowedRoles={["RECEPTIONIST", "ADMIN", "SUPERADMIN"]}><ReceptionistDashboard /></ProtectedRoute>} />
                  <Route path="/receptionist/walk-in-registration" element={<ProtectedRoute allowedRoles={["RECEPTIONIST", "ADMIN", "SUPERADMIN"]}><ReceptionistWalkinMember /></ProtectedRoute>} />
                  <Route path="/receptionist/new-sign-ups" element={<ProtectedRoute allowedRoles={["RECEPTIONIST", "ADMIN", "SUPERADMIN"]}><ReceptionistMembershipSignups /></ProtectedRoute>} />
                  <Route path="/receptionist/qr-attendance" element={<ProtectedRoute allowedRoles={["RECEPTIONIST", "ADMIN", "SUPERADMIN"]}><ReceptionistQRCode /></ProtectedRoute>} />
                  <Route path="/receptionist/qrcheckin" element={<ProtectedRoute allowedRoles={["RECEPTIONIST", "ADMIN", "SUPERADMIN"]}><ReceptionistQrCheckin /></ProtectedRoute>} />
                  <Route path="/receptionist/book-classes-sessions" element={<ProtectedRoute allowedRoles={["RECEPTIONIST", "ADMIN", "SUPERADMIN"]}><ReceptionistBookGroupClasses /></ProtectedRoute>} />
                  <Route path="/receptionist/payemnet" element={<ProtectedRoute allowedRoles={["RECEPTIONIST", "ADMIN", "SUPERADMIN"]}><ReceptionistPaymentCollection /></ProtectedRoute>} />
                  <Route path="/receptionist/reportattendance" element={<ProtectedRoute allowedRoles={["RECEPTIONIST", "ADMIN", "SUPERADMIN"]}><ReportsAttendance /></ProtectedRoute>} />
                  <Route path="/receptionist/report-attendance-checkout" element={<ProtectedRoute allowedRoles={["RECEPTIONIST", "ADMIN", "SUPERADMIN"]}><ReceptionistHouseKeepingAttendanceCheckOut /></ProtectedRoute>} />
                  <Route path="/receptionist/report" element={<ProtectedRoute allowedRoles={["RECEPTIONIST", "ADMIN", "SUPERADMIN"]}><ReportsClasses /></ProtectedRoute>} />

                  <Route path="/personaltrainer/dashboard" element={<ProtectedRoute allowedRoles={["PERSONALTRAINER", "ADMIN", "SUPERADMIN"]}><PersonalTrainerDashboard /></ProtectedRoute>} />
                  <Route path="/personaltrainer/classesschedule" element={<ProtectedRoute allowedRoles={["PERSONALTRAINER", "ADMIN", "SUPERADMIN"]}><PersonalTrainerClassesSchedule /></ProtectedRoute>} />
                  <Route path="/personaltrainer/messages" element={<ProtectedRoute allowedRoles={["PERSONALTRAINER", "ADMIN", "SUPERADMIN"]}><PersonalTrainerMessages /></ProtectedRoute>} />
                  <Route path="/personaltrainer/group-classes" element={<ProtectedRoute allowedRoles={["PERSONALTRAINER", "ADMIN", "SUPERADMIN"]}><PersonalTrainerGroupClasses /></ProtectedRoute>} />
                  <Route path="/personaltrainer/bookings" element={<ProtectedRoute allowedRoles={["PERSONALTRAINER", "ADMIN", "SUPERADMIN"]}><PersonalSessionBooking /></ProtectedRoute>} />
                  <Route path="/personaltrainer/qrcheckin" element={<ProtectedRoute allowedRoles={["PERSONALTRAINER", "ADMIN", "SUPERADMIN"]}><PersonalTrainerQrCheckin /></ProtectedRoute>} />
                  <Route path="/personaltrainer/personalattendance" element={<ProtectedRoute allowedRoles={["PERSONALTRAINER", "ADMIN", "SUPERADMIN"]}><PersonalAttendance /></ProtectedRoute>} />
                  <Route path="/personaltrainer/personalplansbookings" element={<ProtectedRoute allowedRoles={["PERSONALTRAINER", "ADMIN", "SUPERADMIN"]}><PersonalPlansBookings /></ProtectedRoute>} />
                  <Route path="/personaltrainer/shift-managment" element={<ProtectedRoute allowedRoles={["PERSONALTRAINER", "ADMIN", "SUPERADMIN"]}><PersonsalTrainerShiftManagement /></ProtectedRoute>} />
                  <Route path="/personaltrainer/report" element={<ProtectedRoute allowedRoles={["PERSONALTRAINER", "ADMIN", "SUPERADMIN"]}><PersonsalReportsClasses /></ProtectedRoute>} />

                  <Route path="/housekeeping/dashboard" element={<ProtectedRoute allowedRoles={["HOUSEKEEPING", "ADMIN", "SUPERADMIN"]}><HouseKeepingDashboard /></ProtectedRoute>} />
                  <Route path="/housekeeping/qrcheckin" element={<ProtectedRoute allowedRoles={["HOUSEKEEPING", "ADMIN", "SUPERADMIN"]}><HouseKeepingQrCheckin /></ProtectedRoute>} />
                  <Route path="/housekeeping/members" element={<ProtectedRoute allowedRoles={["HOUSEKEEPING", "ADMIN", "SUPERADMIN"]}><HousekeepingShiftView /></ProtectedRoute>} />
                  <Route path="/housekeeping/membership-plan" element={<ProtectedRoute allowedRoles={["HOUSEKEEPING", "ADMIN", "SUPERADMIN"]}><HouseKeepingAttendance /></ProtectedRoute>} />
                  <Route path="/housekeeping/duty-roster" element={<ProtectedRoute allowedRoles={["HOUSEKEEPING", "ADMIN", "SUPERADMIN"]}><HousekeepingTask /></ProtectedRoute>} />
                  <Route path="/housekeeping/class-schedule" element={<ProtectedRoute allowedRoles={["HOUSEKEEPING", "ADMIN", "SUPERADMIN"]}><HouseKeepingNotifications /></ProtectedRoute>} />
                  <Route path="/housekeeping/shift-management" element={<ProtectedRoute allowedRoles={["HOUSEKEEPING", "ADMIN", "SUPERADMIN"]}><HouseKeepingShiftManagement /></ProtectedRoute>} />

                </Routes>
              </ErrorBoundary>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default App;
