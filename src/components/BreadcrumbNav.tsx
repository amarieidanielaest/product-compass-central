
// Legacy component - use ResponsiveBreadcrumb instead
import ResponsiveBreadcrumb from './ResponsiveBreadcrumb';

interface BreadcrumbItem {
  label: string;
  action?: () => void;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  currentProduct?: string;
}

const BreadcrumbNav = ({ items, currentProduct }: BreadcrumbNavProps) => {
  return <ResponsiveBreadcrumb items={items} currentProduct={currentProduct} />;
};

export default BreadcrumbNav;
