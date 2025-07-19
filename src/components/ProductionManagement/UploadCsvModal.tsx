import { motion, AnimatePresence } from "framer-motion";
import { Check, CircleAlert, DownloadCloud, X } from "lucide-react";
import getWidthClass from "@/utils/getWidthClass";
import FileUploadComponent from "../Upload/FileUploadComponent";
import { useState } from "react";
import Image from "next/image";
import AssetsFiles from "@/assets";

interface UploadCsvModalProps {
  isOpen: boolean;
  size: "sm" | "md" | "lg" | "xl" | "full" | number;
  onClose: () => void;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 20 },
};

const UploadCsvModal: React.FC<UploadCsvModalProps> = ({
  isOpen,
  size,
  onClose,
}) => {
  const [imageUrl, setImageUrl] = useState("");
  console.log(imageUrl);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center py-4 items-center z-50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            key="modal"
            className={`shadow-xl rounded-lg ${getWidthClass(
              size
            )} bg-white overflow-hidden flex flex-col max-h-[90vh]`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="bg-[#15BA5C] h-[17px]" />
            {/* Content wrapper scrolls if overflow */}
            <div className="px-3 py-3 overflow-y-auto flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#1C1B20] text-[23px] font-bold">
                    Bulk Upload Data
                  </h3>
                  <p className="text-[#737373] text-[13px]">
                    Upload your data through CSV OR XLS file.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="bg-[#15BA5C] px-1.5 py-1.5 rounded-full"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
              <div className="flex">
                {/* <div className="">This is to hold the timeline thing</div> */}
                <div className="">
                  {/* Step 1 */}
                  <div className="flex items-center justify-between mt-6 border border-[#E6E6E6] rounded-[10px] px-3.5 py-2.5 shadow-xs">
                    <div className="flex flex-col gap-1">
                      <p className="text-[#15BA5C]">Step 1</p>
                      <h3 className="text-[18px] font-medium">
                        Download our Product List Template
                      </h3>
                      <p className="text-[#737373] text-[13px]">
                        The template contains headers for each field required
                        for bulk upload{" "}
                      </p>
                    </div>
                    <button
                      className="bg-[#15BA5C] text-[#FFFFFF] flex items-center py-2 px-3 rounded-[10px] gap-2.5 "
                      type="button"
                    >
                      <DownloadCloud className="h-[16px]" />
                      <span className="font-normal text-[15px]">
                        Download CSV Template
                      </span>
                    </button>
                  </div>
                  {/* Step 2 */}
                  <div className="mt-6 border border-[#E6E6E6] rounded-[10px] px-3.5 py-2.5 shadow-xs">
                    <p className="text-[#15BA5C]">Step 2</p>
                    <h3 className="text-[18px] font-medium">
                      Prepare, copy or input your Product item list into the
                      template{" "}
                    </h3>
                    <p className="text-[#737373] text-[13px]">
                      Fill in the product upload template with details for each
                      product item. Ensure that all mandatory fields are filled,
                      and data is accurate. Make sure the menu list data you
                      copy matches the column headings provided in the template
                      and do not use comma in any of the field.
                    </p>
                  </div>
                  {/* Step 3 */}
                  <div className="mt-6 border border-[#E6E6E6] rounded-[10px] px-3.5 py-2.5 shadow-xs">
                    <p className="text-[#15BA5C]">Step 3</p>
                    <h3 className="text-[18px] font-medium">
                      Upload the updated template file
                    </h3>
                    <FileUploadComponent setImageUrl={setImageUrl} />
                  </div>
                </div>
              </div>
              <div className="my-7">
                <h3 className="text-[#1C1B20] text-[22px] my-2">
                  Upload Succesful
                </h3>
                {/* Parent Container */}
                <div className="flex flex-col gap-2.5 bg-[#FAFAFC] px-4 py-2.5 rounded-[10px]">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2.5 bg-[#FFFFFF] px-2.5 py-2.5 shadow-xs rounded-[9px]">
                      <div className="flex items-center gap-1.5">
                        <div className="bg-[#FAFAFC] px-2 py-3 ">
                          <Check className="h-[14px] text-[#15BA5C]" />
                        </div>
                        <p className="font-bold text-[20px]">10</p>
                      </div>
                      <p className="text-[#1E1E1E] text-[13px]">
                        Rows had no errors and will be processed
                      </p>
                    </div>

                    <div className="flex flex-col gap-2.5 bg-[#FFFFFF] px-2.5 py-2.5 shadow-xs rounded-[9px]">
                      <div className="flex items-center gap-1.5">
                        <Image
                          src={AssetsFiles.CsvCheck}
                          alt="Warning"
                          width={37}
                          height={35}
                        />
                        <p className="font-bold text-[20px]">10</p>
                      </div>
                      <p className="text-[#1E1E1E] text-[13px]">
                        Rows have duplicate entries
                      </p>
                    </div>
                    <div className="flex flex-col gap-2.5 bg-[#FFFFFF] px-2.5 py-2.5 shadow-xs rounded-[9px]">
                      <div className="flex items-center gap-1.5">
                        <div className="bg-red-100 rounded-[10px] px-2 py-3 ">
                          <CircleAlert className="h-[15px] font-bold w-[20px] text-[#FF5247]" />
                        </div>
                        <p className="font-bold text-[20px]">10</p>
                      </div>
                      <p className="text-[#1E1E1E] text-[13px]">
                        Rows received errors and will not be processed
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#FFFFFF] px-2.5 py-3 rounded-[10px]">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-red-100 rounded-[10px] px-2 py-3 ">
                        <CircleAlert className="h-[15px] font-bold w-[20px] text-[#FF5247]" />
                      </div>
                      <p className="font-bold text-[22px]">20 Errors</p>
                    </div>
                    <ul>
                      <li className="flex items-center gap-2.5 mt-2">
                        <span className="h-[6px] w-[6px] rounded-full bg-black"></span>
                        <span className="">
                          “ 3984u3neuok” on row 2 is rejected as it is not a
                          real value
                        </span>
                      </li>
                      <li className="flex items-center gap-2.5 mt-2">
                        <span className="h-[6px] w-[6px] rounded-full bg-black"></span>
                        <span className="">
                          “ 3984u3neuok” on row 2 is rejected as it is not a
                          real value
                        </span>
                      </li>
                      <li className="flex items-center gap-2.5 mt-2">
                        <span className="h-[6px] w-[6px] rounded-full bg-black"></span>
                        <span className="">
                          “ 3984u3neuok” on row 2 is rejected as it is not a
                          real value
                        </span>
                      </li>
                      <li className="flex items-center gap-2.5 mt-2">
                        <span className="h-[6px] w-[6px] rounded-full bg-black"></span>
                        <span className="">
                          “ 3984u3neuok” on row 2 is rejected as it is not a
                          real value
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="my-2.5">
                <StatusTable />
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  className="bg-[#15BA5C] text-[#FFFFFF] py-2.5 flex-1/2 rounded-[10px] text-[15px]"
                  type="button"
                >
                  Merge Duplicate Entries
                </button>
                <button
                  className="text-[#15BA5C] border border-[#E6E6E6] py-2.5 rounded-[10px] flex-1/2 text-[15px]"
                  type="button"
                >
                  Skip Duplicate
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UploadCsvModal;

interface TableRow {
  id: number;
  itemName: string;
  description: string;
  price: string;
  category: string;
  allergens: string;
  availability: string;
  status: "ok" | "error";
}

const StatusTable: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<"all" | "ok" | "error">(
    "all"
  );

  const data: TableRow[] = [
    {
      id: 1,
      itemName: "Muffin",
      description: "Sweet, yummy Cake",
      price: "£10",
      category: "Cake",
      allergens: "Fish, Milk",
      availability: "Yes",
      status: "ok",
    },
    {
      id: 2,
      itemName: "Muffin",
      description: "3984uSneukk fo",
      price: "£ws",
      category: "34",
      allergens: "Fish, Milk",
      availability: "Yes",
      status: "error",
    },
    {
      id: 3,
      itemName: "Muffin",
      description: "uf0auf",
      price: "£10",
      category: "Cake",
      allergens: "49592",
      availability: "Yes",
      status: "error",
    },
  ];

  const filteredData = data.filter((row) => {
    if (activeFilter === "all") return true;
    return row.status === activeFilter;
  });

  const getStatusCount = (status: "all" | "ok" | "error") => {
    if (status === "all") return data.length;
    return data.filter((row) => row.status === status).length;
  };

  const StatusButton: React.FC<{
    status: "all" | "ok" | "error";
    label: string;
    count: number;
  }> = ({ status, label, count }) => (
    <button
      onClick={() => setActiveFilter(status)}
      className={`px-4 py-2 text-sm font-medium rounded-none border-b-2 transition-colors ${
        activeFilter === status
          ? "text-green-600 border-green-600 bg-green-50"
          : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
      }`}
    >
      {label} ({count})
    </button>
  );

  return (
    <div className="w-full   bg-white ">
      {/* Filter Tabs */}
      <div className="border-b border-[#E6E6E6]">
        <div className="flex space-x-0">
          <StatusButton
            status="all"
            label="All"
            count={getStatusCount("all")}
          />
          <StatusButton status="ok" label="Ok" count={getStatusCount("ok")} />
          <StatusButton
            status="error"
            label="Error"
            count={getStatusCount("error")}
          />
        </div>
      </div>

      {/* Table */}
      <div className="w-full my-1.5">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Row
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Allergens
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Availability
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.itemName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={
                      row.status === "error"
                        ? "text-red-600 underline"
                        : "text-gray-900"
                    }
                  >
                    {row.description}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={
                      row.status === "error"
                        ? "text-red-600 underline"
                        : "text-gray-900"
                    }
                  >
                    {row.price}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={
                      row.status === "error"
                        ? "text-red-600 underline"
                        : "text-gray-900"
                    }
                  >
                    {row.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={
                      row.status === "error"
                        ? "text-red-600 underline"
                        : "text-gray-900"
                    }
                  >
                    {row.allergens}
                  </span>
                  {row.status === "ok" && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-green-500 rounded-full">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.availability}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
