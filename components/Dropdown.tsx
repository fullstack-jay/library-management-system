import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  label: string;
  onClick: () => void;
  variant?: 'normal' | 'danger' | 'warning';
  icon?: React.ReactNode;
}

interface DropdownProps {
  trigger: React.ReactNode;
  options: DropdownOption[];
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        triggerRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isOpen) {
      // Calculate position based on trigger element
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 192, // 192 is width of dropdown (w-48)
      });
    }

    setIsOpen(!isOpen);
  };

  const handleOptionClick = (onClick: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
    setIsOpen(false);
  };

  const getVariantStyles = (variant?: string) => {
    switch (variant) {
      case 'danger':
        return 'text-red-600 hover:bg-red-50';
      case 'warning':
        return 'text-orange-600 hover:bg-orange-50';
      default:
        return 'text-gray-700 hover:bg-gray-50';
    }
  };

  return (
    <>
      <div ref={triggerRef} onClick={handleTriggerClick}>
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[9999]"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {options.map((option, index) => (
            <button
              key={index}
              onClick={handleOptionClick(option.onClick)}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${getVariantStyles(
                option.variant
              )}`}
            >
              {option.icon && <span className="shrink-0">{option.icon}</span>}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
};
