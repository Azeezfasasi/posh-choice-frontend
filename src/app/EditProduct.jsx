import { Helmet } from 'react-helmet'
import DashHeader from '../assets/components/dashboard-components/DashHeader'
import DashMenu from '../assets/components/dashboard-components/DashMenu'
import EditProductMain from '../assets/components/product/EditProductMain'

function EditProduct() {
  return (
    <>
    <Helmet>
        <title>Edit Product - Posh Choice Store</title>
    </Helmet>
    <DashHeader />
    <div className='flex flex-row justify-start gap-4'>
      <div className='hidden lg:block w-[20%]'>
        <DashMenu />
      </div>
      <div className='w-full lg:w-[80%]'>
        <EditProductMain />
      </div>
    </div>
    </>
  )
}

export default EditProduct