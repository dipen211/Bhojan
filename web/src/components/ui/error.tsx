interface Props {
  message?: string;
}

export default function Error({ message }: Props) {
  return (
    <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-5 text-sm font-medium text-rose-700">
      {message || "Something went wrong while loading this section."}
    </div>
  );
}
