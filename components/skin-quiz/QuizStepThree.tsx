'use client';

import { useFormContext } from 'react-hook-form';
import { Select, Input, Radio, Typography, Space, Divider, Tag, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState, useRef } from 'react';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

// Common skincare ingredients
const commonIngredients = [
  { value: 'hyaluronic acid', label: 'Hyaluronic Acid' },
  { value: 'vitamin c', label: 'Vitamin C' },
  { value: 'retinol', label: 'Retinol' },
  { value: 'niacinamide', label: 'Niacinamide' },
  { value: 'salicylic acid', label: 'Salicylic Acid' },
  { value: 'glycolic acid', label: 'Glycolic Acid' },
  { value: 'lactic acid', label: 'Lactic Acid' },
  { value: 'peptides', label: 'Peptides' },
  { value: 'ceramides', label: 'Ceramides' },
  { value: 'azelaic acid', label: 'Azelaic Acid' },
  { value: 'benzoyl peroxide', label: 'Benzoyl Peroxide' },
  { value: 'tea tree oil', label: 'Tea Tree Oil' },
  { value: 'aloe vera', label: 'Aloe Vera' },
  { value: 'green tea', label: 'Green Tea' },
  { value: 'centella asiatica', label: 'Centella Asiatica' },
];

// Common ingredients to avoid
const commonAvoidIngredients = [
  { value: 'fragrance', label: 'Fragrance' },
  { value: 'alcohol', label: 'Alcohol' },
  { value: 'parabens', label: 'Parabens' },
  { value: 'sulfates', label: 'Sulfates' },
  { value: 'mineral oil', label: 'Mineral Oil' },
  { value: 'silicones', label: 'Silicones' },
  { value: 'essential oils', label: 'Essential Oils' },
  { value: 'coconut oil', label: 'Coconut Oil' },
  { value: 'lanolin', label: 'Lanolin' },
  { value: 'talc', label: 'Talc' },
];

export default function QuizStepThree() {
  const { setValue, watch, formState: { errors } } = useFormContext();
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<Input>(null);
  
  // Get current values
  const routinePreferences = watch('routinePreferences') || {};
  const currentProducts = routinePreferences.currentProducts || [];
  const preferredIngredients = routinePreferences.preferredIngredients || [];
  const avoidIngredients = routinePreferences.avoidIngredients || [];
  const budget = routinePreferences.budget || 'medium';
  const routineComplexity = routinePreferences.routineComplexity || 'moderate';
  
  // Handle current products input
  const handleCurrentProductsChange = (value: string[]) => {
    setValue('routinePreferences.currentProducts', value, { shouldValidate: true });
    updateQuizResponses('currentProducts', value);
  };
  
  // Handle preferred ingredients selection
  const handlePreferredIngredientsChange = (value: string[]) => {
    setValue('routinePreferences.preferredIngredients', value, { shouldValidate: true });
    updateQuizResponses('preferredIngredients', value);
  };
  
  // Handle ingredients to avoid selection
  const handleAvoidIngredientsChange = (value: string[]) => {
    setValue('routinePreferences.avoidIngredients', value, { shouldValidate: true });
    updateQuizResponses('avoidIngredients', value);
  };
  
  // Handle budget selection
  const handleBudgetChange = (e: any) => {
    setValue('routinePreferences.budget', e.target.value, { shouldValidate: true });
    updateQuizResponses('budget', e.target.value);
  };
  
  // Handle routine complexity selection
  const handleComplexityChange = (e: any) => {
    setValue('routinePreferences.routineComplexity', e.target.value, { shouldValidate: true });
    updateQuizResponses('routineComplexity', e.target.value);
  };
  
  // Update quiz responses
  const updateQuizResponses = (field: string, value: any) => {
    const existingResponses = watch('quizResponses') || [];
    const questionId = `routinePreferences.${field}`;
    const questionIndex = existingResponses.findIndex(q => q.questionId === questionId);
    
    if (questionIndex >= 0) {
      // Update existing response
      const updatedResponses = [...existingResponses];
      updatedResponses[questionIndex] = {
        questionId,
        answer: value
      };
      setValue('quizResponses', updatedResponses);
    } else {
      // Add new response
      setValue('quizResponses', [
        ...existingResponses,
        {
          questionId,
          answer: value
        }
      ]);
    }
  };
  
  // Handle adding custom current product
  const handleInputConfirm = () => {
    if (inputValue && !currentProducts.includes(inputValue)) {
      const updatedProducts = [...currentProducts, inputValue];
      setValue('routinePreferences.currentProducts', updatedProducts, { shouldValidate: true });
      updateQuizResponses('currentProducts', updatedProducts);
    }
    setInputVisible(false);
    setInputValue('');
  };
  
  // Handle removing a current product
  const handleRemoveProduct = (product: string) => {
    const updatedProducts = currentProducts.filter(p => p !== product);
    setValue('routinePreferences.currentProducts', updatedProducts, { shouldValidate: true });
    updateQuizResponses('currentProducts', updatedProducts);
  };
  
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <Title level={3}>Your Skincare Preferences</Title>
        <Paragraph>
          Tell us about your current routine and preferences to help us recommend products
          that will work best for you.
        </Paragraph>
      </div>
      
      {/* Current Products Section */}
      <div className="space-y-4">
        <Title level={4}>Current Products</Title>
        <Paragraph>
          What skincare products are you currently using? (Optional)
        </Paragraph>
        
        <div className="flex flex-wrap gap-2">
          {currentProducts.map(product => (
            <Tag
              key={product}
              closable
              onClose={() => handleRemoveProduct(product)}
              className="text-base py-1 px-2"
            >
              {product}
            </Tag>
          ))}
          
          {inputVisible ? (
            <Input
              ref={inputRef}
              type="text"
              size="small"
              className="w-[200px]"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onBlur={handleInputConfirm}
              onPressEnter={handleInputConfirm}
              autoFocus
            />
          ) : (
            <Tag 
              onClick={() => {
                setInputVisible(true);
                setTimeout(() => inputRef.current?.focus(), 10);
              }}
              className="bg-blue-50 border-blue-200 text-blue-600 cursor-pointer"
            >
              <PlusOutlined /> Add Product
            </Tag>
          )}
        </div>
      </div>
      
      <Divider />
      
      {/* Preferred Ingredients Section */}
      <div className="space-y-4">
        <Title level={4}>Preferred Ingredients</Title>
        <Paragraph>
          Select ingredients you prefer in your skincare products. (Optional)
        </Paragraph>
        
        <Select
          mode="multiple"
          allowClear
          style={{ width: '100%' }}
          placeholder="Select preferred ingredients"
          value={preferredIngredients}
          onChange={handlePreferredIngredientsChange}
          options={commonIngredients}
          className="w-full"
        />
      </div>
      
      <Divider />
      
      {/* Ingredients to Avoid Section */}
      <div className="space-y-4">
        <Title level={4}>Ingredients to Avoid</Title>
        <Paragraph>
          Select ingredients you prefer to avoid in your skincare products. (Optional)
        </Paragraph>
        
        <Select
          mode="multiple"
          allowClear
          style={{ width: '100%' }}
          placeholder="Select ingredients to avoid"
          value={avoidIngredients}
          onChange={handleAvoidIngredientsChange}
          options={commonAvoidIngredients}
          className="w-full"
        />
      </div>
      
      <Divider />
      
      {/* Budget Section */}
      <div className="space-y-4">
        <Title level={4}>Budget Preference</Title>
        <Paragraph>
          What's your preferred budget range for skincare products?
        </Paragraph>
        
        <Radio.Group onChange={handleBudgetChange} value={budget}>
          <Space direction="vertical">
            <Radio value="low">Budget-Friendly (Under $20 per product)</Radio>
            <Radio value="medium">Mid-Range ($20-$50 per product)</Radio>
            <Radio value="high">Premium ($50+ per product)</Radio>
          </Space>
        </Radio.Group>
      </div>
      
      <Divider />
      
      {/* Routine Complexity Section */}
      <div className="space-y-4">
        <Title level={4}>Routine Complexity</Title>
        <Paragraph>
          How complex would you like your skincare routine to be?
        </Paragraph>
        
        <Radio.Group onChange={handleComplexityChange} value={routineComplexity}>
          <Space direction="vertical">
            <Radio value="simple">Simple (3 or fewer products)</Radio>
            <Radio value="moderate">Moderate (4-6 products)</Radio>
            <Radio value="comprehensive">Comprehensive (7+ products)</Radio>
          </Space>
        </Radio.Group>
      </div>
    </div>
  );
}
