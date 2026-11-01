import { Helmet } from 'react-helmet'
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout';
import EditProductMain from '../assets/components/product/EditProductMain'

function EditProduct() {
  return (
    <>
    <Helmet>
        <title>Edit Product - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="Edit product">
        <EditProductMain />
    </DashboardLayout>
    </>
  )
}

export default EditProduct