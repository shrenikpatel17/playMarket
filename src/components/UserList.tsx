import { User } from '@/types/market';
import Image from 'next/image';

interface UserListProps {
  users: User[];
}

export default function UserList({ users }: UserListProps) {
  const formatBalance = (balance: number) => {
    if (balance >= 1000000) return `$${(balance / 1000000).toFixed(1)}M`;
    if (balance >= 1000) return `$${(balance / 1000).toFixed(1)}K`;
    return `$${balance.toLocaleString()}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="font-semibold mb-4">Active Traders</h3>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {users.map(user => (
          <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600">
              {/* <Image
                src={user.avatar}
                alt={user.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              /> */}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{user.name}</div>
              <div className="text-xs text-gray-500">ID: {user.id}</div>
            </div>
            
            <div className="text-right">
              <div className="font-semibold text-sm">{formatBalance(user.balance)}</div>
              <div className="text-xs text-gray-500">Balance</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Total Users: {users.length}</span>
          <span>
            Total Capital: {formatBalance(users.reduce((sum, user) => sum + user.balance, 0))}
          </span>
        </div>
      </div>
    </div>
  );
} 