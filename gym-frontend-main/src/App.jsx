import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { useState, useEffect } from "react";
import * as echarts from "echarts";


import Navbar from "./Layout/Navbar";
import Login from "./Auth/Login";
import Signup from "./Auth/Signup";
import ForgotPassword from "./Auth/ForgotPassword";
import Sidebar from "./Layout/Sidebar";
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
              <Routes>

                <Route path="/superadmin/dashboard" element={<DashboardHomePage />} />
                <Route path="/superadmin/Admin" element={<SuperAdminOwner />} />
                <Route path="/superadmin/Plans&Pricing" element={<Plans />} />
                <Route path="superadmin/payments" element={<Payments />} />
                <Route path="/superadmin/setting" element={<Setting />} />
                <Route path="/superadmin/request-plan" element={<Request />} />
                <Route path="/admin/dashboard" element={<AdminDashbaord />} />
                <Route path="admin/admindashboard" element={<AdminDashbaord />} />
                <Route path="admin/group" element={<Groups />} />
                <Route path="admin/CreatePlan" element={<CreatePlan />} />

                {/* admin dahsboard */}
                <Route path="admin/admin-dashboard" element={<AdminDashbaord />} />
                <Route path="admin/qrcheckin" element={<QrCheckin />} />
                <Route path="admin/AdminMember" element={<AdminMember />} />

                {/* booking */}
                <Route path="/admin/booking/attendance" element={<AttendanceReport />} />
                <Route path="/admin/booking/personal-training" element={<PersonalTraining />} />
                <Route path="/admin/AdminBranches" element={<SuperAdminBranches />} />
                <Route path="/admin/ClassesSchedule" element={<ClassesSchedule />} />
                <Route path="/admin/bookings" element={<PersonalTrainerSessionBookings />} />

                {/* Marketibg */}
                <Route path="marketing/campaigns" element={<Campaigns />} />
                <Route path="marketing/email-sms" element={<EmailsSms />} />

                {/* Members */}
                <Route path="/admin/members/manage-members" element={<ManageMembers />} />
                <Route path="/admin/members/qr-code-attendance" element={<QrCodeAttendance />} />
                <Route path="/admin/members/walk-in-registration" element={<WalkInRegistration />} />

                {/* Payments Routes */}
                <Route path="/admin/payments/membership" element={<Membership />} />

                {/* Reports  */}
                <Route path="/admin/reports/sales" element={<SalesReport />} />
                <Route path="/admin/reports/AttendanceReport" element={<AttendanceReport />} />

                {/* Staff Routes */}
                <Route path="/admin/staff/manage-staff" element={<ManageStaff />} />
                <Route path="/admin/staff/roles-permissions" element={<RolesPermissions />} />
                <Route path="/admin/staff/attendance" element={<StaffAttendance />} />
                <Route path="/admin/staff/duty-roster" element={<DutyRoster />} />
                <Route path="/admin/staff/salary-calculator" element={<SalaryCalculator />} />
                <Route path="/admin/shift-managment" element={<ShiftManagement />} />
                <Route path="/admin/task-managment" element={<AdminTaskManagement />} />
                {/* setting routes */}
                <Route path="/admin/settings/BranchManagement" element={< BranchManagement />} />
                <Route path="/admin/settings/RoleManagement" element={< RoleManagement />} />
                <Route path="/admin/settings" element={< AdminSetting />} />

                {/* admin dahsboard end */}

                {/* Manager Dashbaord */}
                <Route path="/manager/dashboard" element={<Dashboard />} />
                <Route path="/manager/members" element={<MemberManagement />} />
                {/* <Route path="/manager/membership-plan" element={<MembershipPlans />} /> */}
                <Route path="/manager/duty-roster" element={<StaffManagement />} />
                <Route path="/manager/class-schedule" element={<ClassScheduling />} />
                <Route path="/manager/reports" element={<Reports />} />
                <Route path="/manager/communication" element={<Communication />} />
                <Route path="/housekeeping/dashboard" element={<HouseKeepingDashboard />} />

                <Route path="/generaltrainer/dashboard" element={<GeneralTrainerDashboard />} />
                <Route path="/generaltrainer/classesschedule" element={<GeneralClassesSchedule />} />
                <Route path="/generaltrainer/bookings" element={<GeneralSessionBooking />} />
                <Route path="/GeneralTrainer/attendance" element={<Attendance />} />
                <Route path="/GeneralTrainer/shift-managment" element={<GeneralTrainerShiftManagement />} />
                {/* <Route path="/GeneralTrainer/MemberInteraction" element={<MemberInteraction />} /> */}
                <Route path="/GeneralTrainer/qrcheckin" element={<GeneralQrCheckin />} />
                <Route path="/GeneralTrainer/Reports" element={<Report />} />
                <Route path="/GeneralTrainer/DailyScedule" element={< DailyScedule />} />
                <Route path="/GeneralTrainer/GroupPlansBookings" element={<GroupPlansBookings />} />

                <Route path="/member/dashboard" element={<MemberDashboard />} />
                <Route path="/member/account" element={<Account />} />
                <Route path="/member/classschedule" element={<ClassSchedule />} />
                <Route path="/member/attendance-history" element={<AttendanceHistory />} />
                <Route path="/member/qrcheckin" element={<MemberQrCheckin />} />
                <Route path="/member/memberattendance" element={<MemberAttendance />} />
                <Route path="/member/viewplan" element={<ViewPlan />} />
                <Route path="/member/requestplan" element={<RequestPlan />} />

                {/* <Route path="/member/memberbooking" element={<MemberBooking />} /> */}
                <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
                <Route path="/receptionist/walk-in-registration" element={<ReceptionistWalkinMember />} />
                <Route path="/receptionist/new-sign-ups" element={<ReceptionistMembershipSignups />} />
                <Route path="/receptionist/qr-attendance" element={<ReceptionistQRCode />} />
                <Route path="/receptionist/qrcheckin" element={<ReceptionistQrCheckin />} />
                <Route path="/receptionist/book-classes-sessions" element={<ReceptionistBookGroupClasses />} />
                <Route path="/receptionist/payemnet" element={<ReceptionistPaymentCollection />} />

                <Route path="/personaltrainer/dashboard" element={<PersonalTrainerDashboard />} />
                <Route path="/personaltrainer/classesschedule" element={<PersonalTrainerClassesSchedule />} />
                <Route path="/personaltrainer/messages" element={<PersonalTrainerMessages />} />
                <Route path="/personaltrainer/group-classes" element={<PersonalTrainerGroupClasses />} />
                <Route path="/personaltrainer/bookings" element={<PersonalSessionBooking />} />
                <Route path="/personaltrainer/qrcheckin" element={<PersonalTrainerQrCheckin />} />
                <Route path="/personaltrainer/personalattendance" element={<PersonalAttendance />} />
                <Route path="/personaltrainer/personalplansbookings" element={<PersonalPlansBookings />} />
                <Route path="/personaltrainer/shift-managment" element={<PersonsalTrainerShiftManagement />} />

                <Route path="/housekeeping/dashboard" element={<HouseKeepingDashboard />} />
                <Route path="/housekeeping/qrcheckin" element={<HouseKeepingQrCheckin />} />
                <Route path="//housekeeping/members" element={<HousekeepingShiftView />} />
                <Route path="/housekeeping/membership-plan" element={<HouseKeepingAttendance />} />
                <Route path="/housekeeping/duty-roster" element={<HousekeepingTask />} />
                <Route path="/housekeeping/class-schedule" element={<HouseKeepingNotifications />} />
                <Route path="/housekeeping/shift-management" element={<HouseKeepingShiftManagement />} />

              </Routes>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default App;
