import { Modal, Button } from "flowbite-react";
import { React, useState, useEffect } from "react";
import { MdOutlineCheckCircleOutline } from "react-icons/md";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { Link } from "react-router-dom";

function PopUp(props) {
  PopUp.defaultProps = {
    btnQty: "2",
  };

  const [twoBtn, setTwoBtn] = useState(false);
  const [noBtn, setNoBtn] = useState(false);
  const [isDismissable, setIsDismissable] = useState(false);
  const [isShowed, setIsShowed] = useState(props.isShowed);

  const contentText = props.contentText;
  const primaryBtn = props.primaryBtn;
  const secondaryBtn = props.secondaryBtn;
  const primaryPath = props.primaryPath;
  const secondaryPath = props.secondaryPath;
  const btnQty = props.btnQty;
  const closeBtn = props.closeBtn;
  const iconProps = props.icon;

  useEffect(() => {
    setIsShowed(true);
  }, []);

  useEffect(() => {
    if (btnQty === "1") {
      setTwoBtn(false);
    } else if (btnQty === "0") {
      setNoBtn(true);
    }
  }, [btnQty]);

  useEffect(() => {
    if (closeBtn === true) {
      setIsDismissable(true);
    }
  }, [closeBtn]);

  const handleClose = () => {
    setIsShowed(!isShowed);
  };

  return (
    <div>
      <Modal size="xl" show={isShowed === true ? true : false}>
        <Modal.Body className="p-14">
          <div className="flex justify-end"></div>
          <div className="text-center">
            {iconProps === "berhasil" ? (
              <MdOutlineCheckCircleOutline className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            ) : (
              <AiOutlineCloseCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            )}

            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              <p>{contentText}</p>
            </h3>
            <div>
              {twoBtn === true ? (
                <div className="flex justify-center gap-4">
                  <Link to={secondaryPath}>
                    <Button color="gray">{secondaryBtn}</Button>
                  </Link>
                  <Link to={primaryPath}>
                    <Button>{primaryBtn}</Button>
                  </Link>
                  {isDismissable && (
                    <Button onClick={handleClose} color={"failure"}>
                      Close
                    </Button>
                  )}
                </div>
              ) : noBtn === true ? (
                isDismissable === true ? (
                  <div className="flex justify-center gap-4">
                    <Button onClick={handleClose} color={"failure"}>
                      Close
                    </Button>
                  </div>
                ) : null
              ) : (
                <div className="flex justify-center gap-4">
                  <Link to={primaryPath}>
                    <Button>{primaryBtn}</Button>
                  </Link>
                  {isDismissable && (
                    <Button onClick={handleClose} color={"failure"}>
                      Close
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default PopUp;
