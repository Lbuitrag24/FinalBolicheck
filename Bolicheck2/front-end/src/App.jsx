/* eslint-disable no-unused-vars */
import { ToastContainer } from "react-toastify";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GuestLayout from "./GuestLayout";
import Home from "./Home";
import HomeClient from "./client/HomeClient";
import AboutUs from "./About_us";
import ContactUs from "./Contact_us";
import Login from "./login";
import Register from "./Register";
import ResetPassword from "./ResetPassword";
import ChangePassword from "./ChangePassword";
import ProtectedRoute from "./hooks/protectedRoute";
import ClientLayout from "./client/ClientLayout";
import AdminLayout from "./admin/AdminLayout";
import CategoryList from "./admin/Categories/CategoryList";
import NewCategory from "./admin/Categories/NewCategory";
import EditCategory from "./admin/Categories/EditCategory";
import PrizeList from "./admin/Prizes/PrizeList";
import NewPrize from "./admin/Prizes/NewPrize";
import EditPrize from "./admin/Prizes/EditPrize";
import ProductList from "./admin/Products/ProductList";
import NewProduct from "./admin/Products/NewProduct";
import EditProduct from "./admin/Products/EditProduct";
import EventList from "./admin/Events/EventList";
import NewEvent from "./admin/Events/NewEvent";
import EditEvent from "./admin/Events/EditEvent";
import UserList from "./admin/Users/UserList";
import EditUser from "./admin/Users/UserEdit";
import UserView from "./admin/Users/UserView";
import SellingList from "./admin/Sellings/SellingList";
import SellingNew from "./admin/Sellings/SellingNew";
import NewUser from "./admin/Users/UserNew";
import Logout from "./Logout";
import ClientPrizeList from "./client/prizes/ClientPrizeList";
import ClientProductList from "./client/products/ProductList";
import Cart from "./client/products/Cart";
import Profile from "./client/Profile";
import EmployeeLayout from "./employee/EmployeeLayout";
import EmployeePrizeList from "./employee/prizes/PrizeList";
import EmployeeProductList from "./employee/products/ProductsList";
import EmployeeSellingList from "./employee/sellings/SellingsList";
import ClientSellingList from "./client/sellings/SellingsList";
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  return (
    <>
    <ToastContainer position = 'bottom-right'
      autoClose = {3000}
      hideProgressBar = {false}
      closeOnClick = {true}
      pauseOnHover = {true}
      draggable = {true}
      theme = 'dark'
      style={{zIndex:99999}}/>
      <Routes>
        <Route
          path="/"
          element={
            <GuestLayout>
              <Home />
            </GuestLayout>
          }
        />
        <Route
          path="/about_us"
          element={
            <GuestLayout>
              <AboutUs />
            </GuestLayout>
          }
        />
        <Route
          path="/contact_us"
          element={
            <GuestLayout>
              <ContactUs />
            </GuestLayout>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password-form" element={<ResetPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ChangePassword />} />

        {/* ADMIN */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["superuser"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute allowedRoles={["superuser"]}>
              <AdminLayout>
                <CategoryList />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories/new"
          element={
            <ProtectedRoute allowedRoles={["superuser"]}>
              <AdminLayout>
                <NewCategory />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["superuser"]}>
              <AdminLayout>
                <EditCategory />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/prizes"
          element={
            <ProtectedRoute allowedRoles={["superuser"]}>
              <AdminLayout>
                <PrizeList />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/prizes/new"
          element={
            <ProtectedRoute allowedRoles={["superuser"]}>
              <AdminLayout>
                <NewPrize />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/prizes/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["superuser"]}>
              <AdminLayout>
                <EditPrize />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute allowedRoles={["superuser"]}>
              <AdminLayout>
                <ProductList />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <ProtectedRoute allowedRoles={["superuser"]}>
              <AdminLayout>
                <NewProduct />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["superuser"]}>
              <AdminLayout>
                <EditProduct />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute allowedRoles={["superuser"]}>
              <AdminLayout>
                <EventList />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events/new"
          element={
            <ProtectedRoute allowedRoles={["superuser"]}>
              <AdminLayout>
                <NewEvent />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["superuser"]}>
              <AdminLayout>
                <EditEvent />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["superuser"]}>
              <AdminLayout>
                <UserList />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/new"
          element={
            <ProtectedRoute allowedRoles={["superuser"]}>
              <AdminLayout>
                <NewUser />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["superuser"]}>
              <AdminLayout>
                <EditUser />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/view/:id"
          element={
            <ProtectedRoute allowedRoles={["superuser"]}>
              <AdminLayout>
                <UserView />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sellings"
          element={
            <ProtectedRoute allowedRoles={["superuser"]}>
              <AdminLayout>
                <SellingList />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sellings/new"
          element={
            <ProtectedRoute allowedRoles={["superuser"]}>
              <AdminLayout>
                <SellingNew />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        {/* CLIENTE */}
        <Route
          path="/client/dashboard"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <ClientLayout>
                <HomeClient />
              </ClientLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/prizes"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <ClientLayout>
                <ClientPrizeList />
              </ClientLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/products"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <ClientLayout>
                <ClientProductList />
              </ClientLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/cart"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <ClientLayout>
                <Cart />
              </ClientLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/contact_us"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <ClientLayout>
                <ContactUs />
              </ClientLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/about_us"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <ClientLayout>
                <AboutUs />
              </ClientLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/my_profile"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <ClientLayout>
                <Profile />
              </ClientLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/client_Selling_List"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <ClientLayout>
                <ClientSellingList />
              </ClientLayout>
            </ProtectedRoute>
          }
        />

        {/* EMPLEADO */}
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <EmployeeLayout/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/prizes"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <EmployeeLayout>
                <EmployeePrizeList/>
              </EmployeeLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/products"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <EmployeeLayout>
                <EmployeeProductList/>
              </EmployeeLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/sellings"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <EmployeeLayout>
                <EmployeeSellingList/>
              </EmployeeLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/sellings/new"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <EmployeeLayout>
              <SellingNew />
              </EmployeeLayout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </>
  );
}

export default App;
