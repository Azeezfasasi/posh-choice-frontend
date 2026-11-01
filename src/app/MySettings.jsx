import { Helmet } from 'react-helmet'
import DashboardLayout from '../assets/components/dashboard-components/DashboardLayout';
import MySettingsMain from '../assets/components/dashboard-components/MySettingsMain'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const fetchUsers = async () => {
    const response = await axios.get(`${API_BASE_URL}/users/me`);
    return response.data;
  };

function MySettings() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['me'],
    queryFn: fetchUsers,
  });

  if (isLoading) return <p>Loading users...</p>;
  if (error) return <p>Error fetching users</p>;

  return (
    <>
    <Helmet>
        <title>Settings - Posh Choice Store</title>
    </Helmet>
    <DashboardLayout title="Settings">
        <MySettingsMain />
        <ul>
        {user.name}
    </ul>
    </DashboardLayout>
    </>
  )
}

export default MySettings