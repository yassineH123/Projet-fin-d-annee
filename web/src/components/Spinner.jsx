export default function Spinner({ size = 'md' }) {
  const s = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }[size];
  return (
    <div className="flex justify-center items-center py-10">
      <div className={`animate-spin rounded-full border-2 border-primary-500 border-t-transparent ${s}`} />
    </div>
  );
}