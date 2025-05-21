'use client';

import { useFormContext } from 'react-hook-form';
import { Radio, Card, Typography, Space } from 'antd';
import Image from 'next/image';

const { Title, Paragraph } = Typography;

// Skin type descriptions and characteristics
const skinTypes = [
  {
    value: 'dry',
    title: 'Dry Skin',
    description: 'Feels tight, may have flaky patches, and lacks natural oils.',
    characteristics: [
      'Feels tight after washing',
      'Prone to flakiness or rough patches',
      'Fine lines appear more visible',
      'Rarely gets oily or has breakouts',
      'Pores are typically small and barely visible'
    ],
    imageUrl: 'https://images.pexels.com/photos/3762892/pexels-photo-3762892.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    value: 'oily',
    title: 'Oily Skin',
    description: 'Produces excess sebum, appears shiny, and is prone to breakouts.',
    characteristics: [
      'Looks shiny, especially in the T-zone',
      'Prone to blackheads and breakouts',
      'Makeup tends to slide off during the day',
      'Pores appear larger and more visible',
      'Rarely feels tight or dry'
    ],
    imageUrl: 'https://images.pexels.com/photos/3764013/pexels-photo-3764013.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    value: 'combination',
    title: 'Combination Skin',
    description: 'Has both oily and dry areas, typically oily in the T-zone and dry on the cheeks.',
    characteristics: [
      'Oily T-zone (forehead, nose, chin)',
      'Dry or normal cheeks',
      'Pores are larger in the T-zone',
      'May have occasional breakouts in oily areas',
      'Different areas require different care'
    ],
    imageUrl: 'https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    value: 'sensitive',
    title: 'Sensitive Skin',
    description: 'Reacts easily to products or environmental factors with redness or irritation.',
    characteristics: [
      'Easily becomes red or irritated',
      'May sting or burn after product application',
      'Reacts to weather changes',
      'Prone to rashes and bumps',
      'Requires gentle, fragrance-free products'
    ],
    imageUrl: 'https://images.pexels.com/photos/3764168/pexels-photo-3764168.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    value: 'normal',
    title: 'Normal Skin',
    description: 'Well-balanced, not too oily or dry, with few imperfections.',
    characteristics: [
      'Balanced - neither too oily nor too dry',
      'Small, barely visible pores',
      'Few to no blemishes',
      'Not sensitive to products',
      'Smooth, even texture and tone'
    ],
    imageUrl: 'https://images.pexels.com/photos/3764174/pexels-photo-3764174.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  }
];

export default function QuizStepOne() {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  
  const selectedSkinType = watch('skinType');
  
  // Handle skin type selection and add to quiz responses
  const handleSkinTypeChange = (value: string) => {
    setValue('skinType', value, { shouldValidate: true });
    
    // Add to quiz responses
    const existingResponses = watch('quizResponses') || [];
    const questionIndex = existingResponses.findIndex(q => q.questionId === 'skinType');
    
    if (questionIndex >= 0) {
      // Update existing response
      const updatedResponses = [...existingResponses];
      updatedResponses[questionIndex] = {
        questionId: 'skinType',
        answer: value
      };
      setValue('quizResponses', updatedResponses);
    } else {
      // Add new response
      setValue('quizResponses', [
        ...existingResponses,
        {
          questionId: 'skinType',
          answer: value
        }
      ]);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Title level={3}>What's Your Skin Type?</Title>
        <Paragraph>
          Understanding your skin type is the first step to finding the right products for your needs.
          Select the option that best describes your skin.
        </Paragraph>
      </div>
      
      <Radio.Group 
        onChange={(e) => handleSkinTypeChange(e.target.value)}
        value={selectedSkinType}
        className="w-full"
      >
        <Space direction="vertical" className="w-full">
          {skinTypes.map((type) => (
            <Radio.Button 
              key={type.value} 
              value={type.value}
              className="w-full p-0 h-auto border-0 overflow-hidden"
            >
              <Card 
                hoverable 
                className={`w-full ${selectedSkinType === type.value ? 'border-primary border-2' : ''}`}
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/4 h-40 relative rounded-md overflow-hidden">
                    <Image
                      src={type.imageUrl}
                      alt={type.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="w-full md:w-3/4">
                    <Title level={4}>{type.title}</Title>
                    <Paragraph>{type.description}</Paragraph>
                    <div className="mt-2">
                      <Paragraph strong>Characteristics:</Paragraph>
                      <ul className="list-disc pl-5">
                        {type.characteristics.map((char, index) => (
                          <li key={index}>{char}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </Radio.Button>
          ))}
        </Space>
      </Radio.Group>
      
      {errors.skinType && (
        <p className="text-red-500 mt-2">
          {errors.skinType.message as string}
        </p>
      )}
    </div>
  );
}
