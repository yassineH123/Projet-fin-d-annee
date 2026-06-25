import { QRCodeSVG } from 'qrcode.react';
import { X, Download } from 'lucide-react';

export default function BookingQR({ booking, onClose }) {
  const ride = booking?.ride || {};
  const qrData = JSON.stringify({
    bookingId: booking?.id,
    rideId: ride?.id,
    from: ride?.from,
    to: ride?.to,
    date: ride?.departureDate,
    seats: booking?.seats,
    passenger: booking?.passengerId,
  });

  const handleDownload = () => {
    const svg = document.getElementById('booking-qr');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 300; canvas.height = 300;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => { ctx.drawImage(img, 0, 0); canvas.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `atlasway-${booking?.id?.slice(0,8)}.png`; a.click(); }); };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}>
      <div className="rounded-2xl p-6 w-full max-w-sm flex flex-col items-center gap-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>

        <div className="flex items-center justify-between w-full">
          <h2 className="font-black text-white text-lg">Billet de réservation</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition"><X size={20} /></button>
        </div>

        <div className="p-4 rounded-2xl bg-white">
          <QRCodeSVG id="booking-qr" value={qrData} size={200} level="M"
            imageSettings={{ src: '/logo.svg', width: 36, height: 36, excavate: true }} />
        </div>

        <div className="w-full text-center">
          <p className="font-bold text-white text-base">{ride.from} → {ride.to}</p>
          <p className="text-sm text-slate-400 mt-1">
            {ride.departureDate ? new Date(ride.departureDate).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : ''}
          </p>
          <p className="text-xs text-slate-500 mt-1">{booking?.seats} place(s) · #{booking?.id?.slice(0, 8).toUpperCase()}</p>
        </div>

        <p className="text-xs text-center text-slate-500">Montrez ce QR code au conducteur avant de monter</p>

        <div className="flex gap-3 w-full">
          <button onClick={handleDownload}
            className="flex-1 h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: 'var(--bg-700)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
            <Download size={14} /> Télécharger
          </button>
          <button onClick={() => {
            const url = `https://wa.me/?text=${encodeURIComponent(`Mon trajet AtlasWay : ${ride.from} → ${ride.to}\nRéservation #${booking?.id?.slice(0,8).toUpperCase()}`)}`;
            window.open(url, '_blank');
          }}
            className="flex-1 h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: '#25D366', color: 'white' }}>
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
