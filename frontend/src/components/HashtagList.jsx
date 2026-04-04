function HashtagList({ hashtags }) {
  if (!hashtags?.length) return null;

  return (
    <div className="flex flex-wrap mt-2 gap-2">
      {hashtags.map((tag, index) => (
        <span
          key={tag._id || `${tag.name}-${index}`}
          className="px-2 py-1 text-sm bg-gray-200 text-gray-800 rounded-full"
        >
          {tag.name}
        </span>
      ))}
    </div>
  );
}

export default HashtagList;
