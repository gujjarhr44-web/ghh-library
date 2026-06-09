import { useState, useEffect } from "react";
import { usePopupSettings, useAnnouncementBanner } from "@/lib/settings-context";
import { X, Info, CheckCircle, AlertTriangle, AlertCircle, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Global Popup Overlay ──────────────────────────────────────────────────────
export function GlobalPopupOverlay() {
  const popup = usePopupSettings();
  const [dismissed, setDismissed] = useState(false);
  const [shownKey, setShownKey] = useState("");

  const popupKey = `${popup.title}-${popup.message}-${popup.enabled}`;

  useEffect(() => {
    if (popupKey !== shownKey) {
      setDismissed(false);
      setShownKey(popupKey);
    }
  }, [popupKey, shownKey]);

  if (!popup.enabled || dismissed) return null;

  const icons = {
    info: <Info className="h-10 w-10 text-blue-500" />,
    success: <CheckCircle className="h-10 w-10 text-green-500" />,
    warning: <AlertTriangle className="h-10 w-10 text-amber-500" />,
    danger: <AlertCircle className="h-10 w-10 text-red-500" />,
    announcement: <Megaphone className="h-10 w-10 text-purple-500" />,
  };

  const colors = {
    info: "from-blue-50 to-indigo-50 border-blue-200",
    success: "from-green-50 to-emerald-50 border-green-200",
    warning: "from-amber-50 to-orange-50 border-amber-200",
    danger: "from-red-50 to-rose-50 border-red-200",
    announcement: "from-purple-50 to-pink-50 border-purple-200",
  };

  const btnColors = {
    info: "bg-blue-600 hover:bg-blue-700",
    success: "bg-green-600 hover:bg-green-700",
    warning: "bg-amber-600 hover:bg-amber-700",
    danger: "bg-red-600 hover:bg-red-700",
    announcement: "bg-purple-600 hover:bg-purple-700",
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => popup.showDismiss && setDismissed(true)}
      />

      {/* Modal */}
      <div className={`relative z-10 w-full max-w-md rounded-2xl border bg-gradient-to-br ${colors[popup.type]} shadow-2xl animate-in fade-in zoom-in-95 duration-300`}>
        {popup.showDismiss && (
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-white/50 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            {icons[popup.type]}
          </div>

          {popup.imageUrl && (
            <img
              src={popup.imageUrl}
              alt="Popup"
              className="mx-auto mb-4 max-h-32 rounded-lg object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}

          <h2 className="text-xl font-bold text-gray-800 mb-2">{popup.title}</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">{popup.message}</p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setDismissed(true)}
              className={`px-6 py-2.5 rounded-lg text-white font-medium text-sm transition-colors ${btnColors[popup.type]}`}
            >
              {popup.buttonText}
            </button>
            {popup.showDismiss && (
              <button
                onClick={() => setDismissed(true)}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-600 font-medium text-sm hover:bg-white/50 transition-colors"
              >
                {popup.dismissText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Announcement Banner ───────────────────────────────────────────────────────
export function AnnouncementBanner() {
  const banner = useAnnouncementBanner();
  const [dismissed, setDismissed] = useState(false);
  const [bannerKey, setBannerKey] = useState("");

  const currentKey = `${banner.message}-${banner.enabled}`;

  useEffect(() => {
    if (currentKey !== bannerKey) {
      setDismissed(false);
      setBannerKey(currentKey);
    }
  }, [currentKey, bannerKey]);

  if (!banner.enabled || dismissed || !banner.message) return null;

  const styles = {
    info: "bg-blue-600 text-white",
    success: "bg-green-600 text-white",
    warning: "bg-amber-500 text-white",
    danger: "bg-red-600 text-white",
  };

  return (
    <div className={`relative w-full py-2.5 px-4 text-center text-sm font-medium ${styles[banner.type]} flex items-center justify-center gap-2`}>
      <span className="flex-1">{banner.message}</span>
      {banner.link && (
        <a
          href={banner.link}
          className="underline underline-offset-2 opacity-90 hover:opacity-100 ml-2"
          target="_blank"
          rel="noreferrer"
        >
          {banner.linkText}
        </a>
      )}
      {banner.dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
