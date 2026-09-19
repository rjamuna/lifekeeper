const StatusBadge = ({ status }) => {
  const isConnected = status === "connected";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
        isConnected
          ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/60"
          : "bg-red-950/60 text-red-400 border-red-800/60"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400"
        }`}
      />
      DB {status}
    </span>
  );
};

export default StatusBadge;
