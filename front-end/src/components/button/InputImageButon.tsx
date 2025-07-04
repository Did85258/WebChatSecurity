import { PaperClipOutlined } from "@ant-design/icons";

export default function InputImageButon({ handleButtonClick }: any) {
  return (
    <button
      className="flex items-center justify-center text-gray-400 hover:text-gray-600"
      onClick={handleButtonClick}
    >
      <PaperClipOutlined />
    </button>
  );
}
