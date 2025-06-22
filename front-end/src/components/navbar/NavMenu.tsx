export default function NavMenu({name, icon}:any ) {
  return (
    <>
      <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">{icon} {name} </li>
    </>
  );
}
