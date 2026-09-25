import Image from "next/image";
import { CHEC } from "@/lib/chec";

export default function ChecChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="chec-header">
        <div className="chec-header-inner">
          <Image
            src={CHEC.brand.logo}
            alt="CHEC Grupo EPM"
            width={CHEC.brand.logoSize.width}
            height={CHEC.brand.logoSize.height}
            priority
          />
          <div className="chec-lockup">
            <strong>{CHEC.brand.lockup}</strong>
            <span>{CHEC.brand.claim}</span>
          </div>
        </div>
      </header>
      {children}
      <footer className="chec-footer">
        <div className="chec-footer-inner">{CHEC.brand.purpose}</div>
      </footer>
    </>
  );
}
