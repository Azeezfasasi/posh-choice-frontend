import { Helmet } from 'react-helmet'
import DashHeader from '../assets/components/dashboard-components/DashHeader'
import DashMenu from '../assets/components/dashboard-components/DashMenu'
import MySettingsMain from '../assets/components/dashboard-components/MySettingsMain'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchUsers = async () => {
    const response = await axios.get('https://itservicepro-backend.onrender.com/api/users/me',);
    return response.data;
  };

function MySettings() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  if (isLoading) return <p>Loading users...</p>;
  if (error) return <p>Error fetching users</p>;

  return (
    <>
    <Helmet>
        <title>Settings - Posh Choice Store</title>
    </Helmet>
    <DashHeader />
    <div className='flex flex-row justify-start gap-4'>
      <div className='hidden lg:block w-[20%]'>
        <DashMenu />
      </div>
      <div className='w-full lg:w-[80%]'>
        <MySettingsMain />
        <ul>
        {user.name}
    </ul>
      </div>
    </div>
    </>
  )
}

export default MySettings