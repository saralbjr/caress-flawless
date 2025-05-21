'use client';

import { useFormContext } from 'react-hook-form';
import { Checkbox, Card, Typography, Row, Col, Divider } from 'antd';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import Image from 'next/image';

const { Title, Paragraph } = Typography;

// Skin concerns with descriptions and images
const skinConcerns = [
  {
    value: 'acne',
    title: 'Acne',
    description: 'Breakouts, pimples, and clogged pores',
    imageUrl: 'https://images.pexels.com/photos/4046567/pexels-photo-4046567.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    value: 'aging',
    title: 'Signs of Aging',
    description: 'Fine lines, wrinkles, and loss of firmness',
    imageUrl: 'https://images.pexels.com/photos/3785424/pexels-photo-3785424.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    value: 'hyperpigmentation',
    title: 'Hyperpigmentation',
    description: 'Dark spots, uneven skin tone, and sun damage',
    imageUrl: 'https://images.pexels.com/photos/6663467/pexels-photo-6663467.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    value: 'redness',
    title: 'Redness',
    description: 'Rosacea, flushing, and general redness',
    imageUrl: 'https://images.pexels.com/photos/6663356/pexels-photo-6663356.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    value: 'dryness',
    title: 'Dryness',
    description: 'Flakiness, tightness, and lack of moisture',
    imageUrl: 'https://images.pexels.com/photos/6663531/pexels-photo-6663531.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    value: 'oiliness',
    title: 'Excess Oil',
    description: 'Shiny skin and enlarged pores',
    imageUrl: 'https://images.pexels.com/photos/6663461/pexels-photo-6663461.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    value: 'sensitivity',
    title: 'Sensitivity',
    description: 'Easily irritated skin that reacts to products',
    imageUrl: 'https://images.pexels.com/photos/6663354/pexels-photo-6663354.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    value: 'dullness',
    title: 'Dullness',
    description: 'Lack of radiance and uneven texture',
    imageUrl: 'https://images.pexels.com/photos/6663464/pexels-photo-6663464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    value: 'uneven texture',
    title: 'Uneven Texture',
    description: 'Rough patches and bumpy skin',
    imageUrl: 'https://images.pexels.com/photos/6663358/pexels-photo-6663358.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    value: 'large pores',
    title: 'Large Pores',
    description: 'Visibly enlarged pores, especially in the T-zone',
    imageUrl: 'https://images.pexels.com/photos/6663465/pexels-photo-6663465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    value: 'blackheads',
    title: 'Blackheads',
    description: 'Clogged pores with dark appearance',
    imageUrl: 'https://images.pexels.com/photos/6663466/pexels-photo-6663466.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    value: 'other',
    title: 'Other Concerns',
    description: 'Any other skin concerns not listed above',
    imageUrl: 'https://images.pexels.com/photos/6663357/pexels-photo-6663357.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  }
];

export default function QuizStepTwo() {
  const { setValue, watch, formState: { errors } } = useFormContext();
  
  const selectedConcerns = watch('skinConcerns') || [];
  
  // Handle skin concerns selection and add to quiz responses
  const handleConcernsChange = (values: CheckboxValueType[]) => {
    setValue('skinConcerns', values, { shouldValidate: true });
    
    // Add to quiz responses
    const existingResponses = watch('quizResponses') || [];
    const questionIndex = existingResponses.findIndex(q => q.questionId === 'skinConcerns');
    
    if (questionIndex >= 0) {
      // Update existing response
      const updatedResponses = [...existingResponses];
      updatedResponses[questionIndex] = {
        questionId: 'skinConcerns',
        answer: values
      };
      setValue('quizResponses', updatedResponses);
    } else {
      // Add new response
      setValue('quizResponses', [
        ...existingResponses,
        {
          questionId: 'skinConcerns',
          answer: values
        }
      ]);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Title level={3}>What Are Your Skin Concerns?</Title>
        <Paragraph>
          Select all the skin concerns you'd like to address with your skincare routine.
          This helps us recommend products that target your specific needs.
        </Paragraph>
      </div>
      
      <Checkbox.Group 
        onChange={handleConcernsChange}
        value={selectedConcerns}
        className="w-full"
      >
        <Row gutter={[16, 16]}>
          {skinConcerns.map((concern) => (
            <Col xs={24} sm={12} md={8} key={concern.value}>
              <Card 
                hoverable 
                className={`h-full ${selectedConcerns.includes(concern.value) ? 'border-primary border-2' : ''}`}
              >
                <Checkbox value={concern.value} className="absolute top-2 right-2 z-10" />
                <div className="flex flex-col h-full">
                  <div className="w-full h-32 relative rounded-md overflow-hidden mb-3">
                    <Image
                      src={concern.imageUrl}
                      alt={concern.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <Title level={5}>{concern.title}</Title>
                  <Paragraph>{concern.description}</Paragraph>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Checkbox.Group>
      
      {errors.skinConcerns && (
        <p className="text-red-500 mt-2">
          {errors.skinConcerns.message as string}
        </p>
      )}
      
      <Divider />
      
      <div className="text-center">
        <Paragraph>
          <strong>Selected concerns:</strong> {selectedConcerns.length > 0 
            ? selectedConcerns.join(', ') 
            : 'None selected'}
        </Paragraph>
      </div>
    </div>
  );
}
