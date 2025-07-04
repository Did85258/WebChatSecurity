export default function ChoseUser({ userName, userId, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2 cursor-pointer"
      //   onClick={() => handleOpenChat(row.user_id, row.user_name)}
    >
      <div className="flex items-center justify-center h-8 w-8 bg-indigo-200 rounded-full">
        {/* {userName.substring(0, 1).toUpperCase()} */}
      </div>
      <div className="ml-2 text-sm font-semibold">{userName}</div>
    </button>
  );
}
