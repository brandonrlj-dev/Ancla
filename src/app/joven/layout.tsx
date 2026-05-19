import type { ReactNode } from 'react';
import Jumper from '@/components/nav/Jumper';

export default function JovenLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Jumper />
    </>
  );
}
