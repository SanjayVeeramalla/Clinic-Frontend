import Sidebar from './Sidebar'

export default function DashboardLayout({ children }) {
  return (
    <div className="layout-with-sidebar">
      <Sidebar />
      <main className="content-area">{children}</main>
    </div>
  )
}