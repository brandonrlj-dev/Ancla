import PCLayoutClient from '@/components/policia/PCLayoutClient';

export default function PoliciaLayout({ children }: { children: React.ReactNode }) {
  return <PCLayoutClient>{children}</PCLayoutClient>;
}
