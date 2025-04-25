import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Components/Table',
}

// Basic Table Example - Simple Employee Payroll Status
export const Basic = () => {
  const Components = useComponentContext()
  return (
    <Components.Table aria-label="Basic Payroll Status">
      <Components.TableHead>
        <Components.TableRow>
          <Components.TableHeader>Employee</Components.TableHeader>
          <Components.TableHeader>Status</Components.TableHeader>
          <Components.TableHeader>Pay Period</Components.TableHeader>
        </Components.TableRow>
      </Components.TableHead>
      <Components.TableBody>
        <Components.TableRow>
          <Components.TableCell>Sarah Johnson</Components.TableCell>
          <Components.TableCell>
            <Components.Badge status="success">Paid</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>March 1-15, 2024</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableCell>Michael Chen</Components.TableCell>
          <Components.TableCell>
            <Components.Badge status="warning">Pending</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>March 1-15, 2024</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableCell>Emily Rodriguez</Components.TableCell>
          <Components.TableCell>
            <Components.Badge status="info">Processing</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>March 1-15, 2024</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableCell>David Kim</Components.TableCell>
          <Components.TableCell>
            <Components.Badge status="success">Paid</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>March 1-15, 2024</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableCell>Rachel Foster</Components.TableCell>
          <Components.TableCell>
            <Components.Badge status="warning">Pending</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>March 16-31, 2024</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableCell>Alex Thompson</Components.TableCell>
          <Components.TableCell>
            <Components.Badge status="info">Processing</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>March 16-31, 2024</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableCell>Jessica Lee</Components.TableCell>
          <Components.TableCell>
            <Components.Badge status="success">Paid</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>March 16-31, 2024</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableCell>Marcus Wilson</Components.TableCell>
          <Components.TableCell>
            <Components.Badge status="warning">Pending</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>March 16-31, 2024</Components.TableCell>
        </Components.TableRow>
      </Components.TableBody>
    </Components.Table>
  )
}

// Comprehensive Table Example - Detailed Payroll Information
export const Comprehensive = () => {
  const Components = useComponentContext()
  return (
    <Components.Table aria-label="Detailed Payroll Information">
      <Components.TableHead>
        <Components.TableRow>
          <Components.TableHeader scope="col">Employee ID</Components.TableHeader>
          <Components.TableHeader scope="col">Name</Components.TableHeader>
          <Components.TableHeader scope="col">Department</Components.TableHeader>
          <Components.TableHeader scope="col">Pay Rate</Components.TableHeader>
          <Components.TableHeader scope="col">Hours</Components.TableHeader>
          <Components.TableHeader scope="col">Gross Pay</Components.TableHeader>
          <Components.TableHeader scope="col">Deductions</Components.TableHeader>
          <Components.TableHeader scope="col">Net Pay</Components.TableHeader>
        </Components.TableRow>
      </Components.TableHead>
      <Components.TableBody>
        <Components.TableRow>
          <Components.TableHeader scope="row">EMP001</Components.TableHeader>
          <Components.TableCell>Robert Wilson</Components.TableCell>
          <Components.TableCell>
            <Components.Badge status="info">Engineering</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>$45.00/hr</Components.TableCell>
          <Components.TableCell>80</Components.TableCell>
          <Components.TableCell>$3,600.00</Components.TableCell>
          <Components.TableCell>$828.00</Components.TableCell>
          <Components.TableCell>$2,772.00</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableHeader scope="row">EMP002</Components.TableHeader>
          <Components.TableCell>Lisa Martinez</Components.TableCell>
          <Components.TableCell>
            <Components.Badge status="success">Sales</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>$35.00/hr</Components.TableCell>
          <Components.TableCell>84</Components.TableCell>
          <Components.TableCell>$2,940.00</Components.TableCell>
          <Components.TableCell>$676.20</Components.TableCell>
          <Components.TableCell>$2,263.80</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableHeader scope="row">EMP003</Components.TableHeader>
          <Components.TableCell>James Thompson</Components.TableCell>
          <Components.TableCell>
            <Components.Badge status="info">Marketing</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>$40.00/hr</Components.TableCell>
          <Components.TableCell>76</Components.TableCell>
          <Components.TableCell>$3,040.00</Components.TableCell>
          <Components.TableCell>$699.20</Components.TableCell>
          <Components.TableCell>$2,340.80</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableHeader scope="row">EMP004</Components.TableHeader>
          <Components.TableCell>Maria Garcia</Components.TableCell>
          <Components.TableCell>
            <Components.Badge status="warning">HR</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>$38.00/hr</Components.TableCell>
          <Components.TableCell>80</Components.TableCell>
          <Components.TableCell>$3,040.00</Components.TableCell>
          <Components.TableCell>$699.20</Components.TableCell>
          <Components.TableCell>$2,340.80</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableHeader scope="row">EMP005</Components.TableHeader>
          <Components.TableCell>Thomas Anderson</Components.TableCell>
          <Components.TableCell>
            <Components.Badge status="info">Engineering</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>$42.00/hr</Components.TableCell>
          <Components.TableCell>82</Components.TableCell>
          <Components.TableCell>$3,444.00</Components.TableCell>
          <Components.TableCell>$792.12</Components.TableCell>
          <Components.TableCell>$2,651.88</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableHeader scope="row">EMP006</Components.TableHeader>
          <Components.TableCell>Sarah Palmer</Components.TableCell>
          <Components.TableCell>
            <Components.Badge status="success">Sales</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>$36.00/hr</Components.TableCell>
          <Components.TableCell>78</Components.TableCell>
          <Components.TableCell>$2,808.00</Components.TableCell>
          <Components.TableCell>$645.84</Components.TableCell>
          <Components.TableCell>$2,162.16</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableHeader scope="row">EMP007</Components.TableHeader>
          <Components.TableCell>Kevin O&apos;Brien</Components.TableCell>
          <Components.TableCell>
            <Components.Badge status="info">Engineering</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>$44.00/hr</Components.TableCell>
          <Components.TableCell>85</Components.TableCell>
          <Components.TableCell>$3,740.00</Components.TableCell>
          <Components.TableCell>$860.20</Components.TableCell>
          <Components.TableCell>$2,879.80</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableHeader scope="row">EMP008</Components.TableHeader>
          <Components.TableCell>Diana Lee</Components.TableCell>
          <Components.TableCell>
            <Components.Badge status="info">Marketing</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>$39.00/hr</Components.TableCell>
          <Components.TableCell>80</Components.TableCell>
          <Components.TableCell>$3,120.00</Components.TableCell>
          <Components.TableCell>$717.60</Components.TableCell>
          <Components.TableCell>$2,402.40</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableHeader scope="row">EMP009</Components.TableHeader>
          <Components.TableCell>Chris Murphy</Components.TableCell>
          <Components.TableCell>
            <Components.Badge status="warning">HR</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>$37.00/hr</Components.TableCell>
          <Components.TableCell>75</Components.TableCell>
          <Components.TableCell>$2,775.00</Components.TableCell>
          <Components.TableCell>$638.25</Components.TableCell>
          <Components.TableCell>$2,136.75</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableHeader scope="row">EMP010</Components.TableHeader>
          <Components.TableCell>Amanda Zhang</Components.TableCell>
          <Components.TableCell>
            <Components.Badge status="info">Engineering</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>$43.00/hr</Components.TableCell>
          <Components.TableCell>82</Components.TableCell>
          <Components.TableCell>$3,526.00</Components.TableCell>
          <Components.TableCell>$811.00</Components.TableCell>
          <Components.TableCell>$2,715.00</Components.TableCell>
        </Components.TableRow>
      </Components.TableBody>
    </Components.Table>
  )
}

// Empty Table Example - No Pending Payments
export const EmptyTable = () => {
  const Components = useComponentContext()
  return (
    <Components.Table aria-label="Pending Payments">
      <Components.TableHead>
        <Components.TableRow>
          <Components.TableHeader>Employee</Components.TableHeader>
          <Components.TableHeader>Amount Due</Components.TableHeader>
          <Components.TableHeader>Due Date</Components.TableHeader>
          <Components.TableHeader>Payment Method</Components.TableHeader>
        </Components.TableRow>
      </Components.TableHead>
      <Components.TableBody
        renderEmptyState={() => (
          <div style={{ margin: '24px' }}>
            <Components.Alert status="info" label="No Pending Payments">
              There are no pending payments to process for this period.
            </Components.Alert>
          </div>
        )}
      >
        {[]}
      </Components.TableBody>
    </Components.Table>
  )
}

// Table with Row and Column Spans - Payroll Summary by Department
export const SpanningTable = () => {
  const Components = useComponentContext()
  return (
    <Components.Table aria-label="Department Payroll Summary">
      <Components.TableHead>
        <Components.TableRow>
          <Components.TableHeader>Department</Components.TableHeader>
          <Components.TableHeader>Employees</Components.TableHeader>
          <Components.TableHeader>Total Hours</Components.TableHeader>
          <Components.TableHeader>Total Payroll</Components.TableHeader>
        </Components.TableRow>
      </Components.TableHead>
      <Components.TableBody>
        <Components.TableRow>
          <Components.TableCell colSpan={2}>
            <Components.Badge status="info">Engineering - 12 Employees</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>964</Components.TableCell>
          <Components.TableCell>$48,200.00</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableCell colSpan={2}>
            <Components.Badge status="success">Sales - 8 Employees</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>632</Components.TableCell>
          <Components.TableCell>$28,440.00</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableCell colSpan={2}>
            <Components.Badge status="info">Marketing - 6 Employees</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>472</Components.TableCell>
          <Components.TableCell>$21,240.00</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableCell colSpan={2}>
            <Components.Badge status="warning">HR - 4 Employees</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>320</Components.TableCell>
          <Components.TableCell>$15,200.00</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableCell colSpan={2}>
            <Components.Badge status="info">IT Support - 5 Employees</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>400</Components.TableCell>
          <Components.TableCell>$18,000.00</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableCell colSpan={2}>
            <Components.Badge status="info">Finance - 6 Employees</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>480</Components.TableCell>
          <Components.TableCell>$22,560.00</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableCell colSpan={2}>
            <Components.Badge status="info">Customer Support - 10 Employees</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>800</Components.TableCell>
          <Components.TableCell>$32,000.00</Components.TableCell>
        </Components.TableRow>
        <Components.TableRow>
          <Components.TableCell colSpan={2}>
            <Components.Badge status="info">Product Management - 4 Employees</Components.Badge>
          </Components.TableCell>
          <Components.TableCell>320</Components.TableCell>
          <Components.TableCell>$16,800.00</Components.TableCell>
        </Components.TableRow>
      </Components.TableBody>
    </Components.Table>
  )
}
