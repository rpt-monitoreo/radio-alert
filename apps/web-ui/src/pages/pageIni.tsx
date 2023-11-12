import { useFetchUsers } from '@/services/inicial';
import ParentComponent from './parent';

function FetchUsers() {
  const { isLoading, error, data } = useFetchUsers();

  if (isLoading) return 'Loading...';

  if (error) return 'An error has occurred: ' + (error as Error).message;

  return <div>{data}</div>;
}

function PageIni() {
  return (
    <div>
      <FetchUsers />
      <ParentComponent />
    </div>
  );
}

export default PageIni;
