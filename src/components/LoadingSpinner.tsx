
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) => {
  const sizeClass = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center w-full h-24">
      <Loader2 className={`${sizeClass[size]} animate-spin text-quicklit-purple`} />
    </div>
  );
};

export default LoadingSpinner;
