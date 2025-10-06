import React from 'react';
import { FormFieldType } from '../../types';
import { ShortTextIcon } from '../icons/ShortTextIcon';
import { LongTextIcon } from '../icons/LongTextIcon';
import { EmailIcon } from '../icons/EmailIcon';
import { NumberIcon } from '../icons/NumberIcon';
import { DateIcon } from '../icons/DateIcon';
import { TimeIcon } from '../icons/TimeIcon';
import { DropdownIcon } from '../icons/DropdownIcon';
import { SingleChoiceIcon } from '../icons/SingleChoiceIcon';
import { MultipleChoiceIcon } from '../icons/MultipleChoiceIcon';
import { FullNameIcon } from '../icons/FullNameIcon';
import { SignatureIcon } from '../icons/SignatureIcon';
import { FileUploadIcon } from '../icons/FileUploadIcon';
import { ImageUploadIcon } from '../icons/ImageUploadIcon';
import { StarRatingIcon as StarRatingIconComponent } from '../icons/StarRatingIcon';
import { ScaleRatingIcon } from '../icons/ScaleRatingIcon';
import { ProductListIcon } from '../icons/ProductListIcon';
import { DividerIcon } from '../icons/DividerIcon';
import { MultiTextIcon } from '../icons/MultiTextIcon';
import { PercentageIcon } from '../icons/PercentageIcon';
import { DocumentIcon } from '../icons/DocumentIcon';


const FormFieldIcon: React.FC<{ type: FormFieldType }> = ({ type }) => {
    switch(type) {
        case FormFieldType.SHORT_TEXT: return <ShortTextIcon />;
        case FormFieldType.LONG_TEXT: return <LongTextIcon />;
        case FormFieldType.EMAIL: return <EmailIcon />;
        case FormFieldType.NUMBER: return <NumberIcon />;
        case FormFieldType.DATE: return <DateIcon />;
        case FormFieldType.TIME: return <TimeIcon />;
        case FormFieldType.DROPDOWN: return <DropdownIcon />;
        case FormFieldType.SINGLE_CHOICE: return <SingleChoiceIcon />;
        case FormFieldType.MULTIPLE_CHOICE: return <MultipleChoiceIcon />;
        case FormFieldType.FULL_NAME: return <FullNameIcon />;
        case FormFieldType.SIGNATURE: return <SignatureIcon />;
        case FormFieldType.FILE_UPLOAD: return <FileUploadIcon />;
        case FormFieldType.IMAGE_UPLOAD: return <ImageUploadIcon />;
        case FormFieldType.STAR_RATING: return <StarRatingIconComponent className='h-5 w-5' />;
        case FormFieldType.SCALE_RATING: return <ScaleRatingIcon />;
        case FormFieldType.PRODUCT_LIST: return <ProductListIcon />;
        case FormFieldType.DIVIDER: return <DividerIcon />;
        case FormFieldType.MULTI_TEXT: return <MultiTextIcon />;
        case FormFieldType.PERCENTAGE: return <PercentageIcon />;
        default: return <DocumentIcon />;
    }
};

export default FormFieldIcon;
