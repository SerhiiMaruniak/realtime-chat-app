import { CheckCircle } from "lucide-react";
import { getHM } from "../../../lib/formatDate";

interface FooterProps {
  isSent: boolean;
  isSeenIndicator: boolean;
  timestamp: string;
}

const Footer = ({ isSent, isSeenIndicator, timestamp }: FooterProps) => (
  <div className={`flex items-center gap-2 mt-0.5 ${isSent ? "justify-end" : ""}`}>
    <p className={`text-label-text text-xs ${isSent ? "text-right" : "text-left"}`}>
      {getHM({ timestamp })}
    </p>
    {isSeenIndicator && <CheckCircle size={16} className="text-label-text" />}
  </div>
);

export default Footer;
