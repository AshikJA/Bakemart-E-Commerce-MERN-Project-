import React from 'react'

function ViewOrders() {
  return (
    <div>
        <h1>View Orders</h1>
        <table border="1">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>John Doe</td>
                    <td>Pending</td>
                    <td>$100</td>
                    <td>2022-01-01</td>
                </tr>
            </tbody>
        </table>
    </div>
  )
}

export default ViewOrders