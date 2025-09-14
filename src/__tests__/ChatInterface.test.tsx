import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatInterface from '../components/ChatInterface';

// Mock the voice service
jest.mock('../services/voiceService', () => ({
  voiceService: {
    isSpeechRecognitionSupported: () => true,
    isSpeechSynthesisSupported: () => true,
    startListening: jest.fn(),
    stopListening: jest.fn(),
    speak: jest.fn(),
    stopSpeaking: jest.fn(),
    isSpeaking: () => false
  }
}));

describe('ChatInterface', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chat interface when open', () => {
    render(<ChatInterface isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Krishi Sakhi')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant • Ready to help')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ChatInterface isOpen={false} onClose={mockOnClose} />);
    
    expect(screen.queryByText('Krishi Sakhi')).not.toBeInTheDocument();
  });

  it('displays initial welcome message', () => {
    render(<ChatInterface isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText(/നമസ്കാരം! I am your Krishi Sakhi/)).toBeInTheDocument();
  });

  it('allows typing and sending messages', async () => {
    render(<ChatInterface isOpen={true} onClose={mockOnClose} />);
    
    const input = screen.getByPlaceholderText(/Type your farming question/);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(input, { target: { value: 'What fertilizer should I use?' } });
    fireEvent.click(sendButton);
    
    expect(screen.getByText('What fertilizer should I use?')).toBeInTheDocument();
  });

  it('switches language between English and Malayalam', () => {
    render(<ChatInterface isOpen={true} onClose={mockOnClose} />);
    
    const languageButton = screen.getByTitle('Switch Language');
    fireEvent.click(languageButton);
    
    expect(screen.getByText('🇮🇳 മലയാളം')).toBeInTheDocument();
  });

  it('handles voice recording toggle', () => {
    render(<ChatInterface isOpen={true} onClose={mockOnClose} />);
    
    const micButton = screen.getByTitle(/Start Recording/);
    fireEvent.click(micButton);
    
    expect(screen.getByText('Recording... Speak now')).toBeInTheDocument();
  });

  it('closes when close button is clicked', () => {
    render(<ChatInterface isOpen={true} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles enter key to send message', () => {
    render(<ChatInterface isOpen={true} onClose={mockOnClose} />);
    
    const input = screen.getByPlaceholderText(/Type your farming question/);
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('disables send button when input is empty', () => {
    render(<ChatInterface isOpen={true} onClose={mockOnClose} />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when input has content', () => {
    render(<ChatInterface isOpen={true} onClose={mockOnClose} />);
    
    const input = screen.getByPlaceholderText(/Type your farming question/);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    
    expect(sendButton).not.toBeDisabled();
  });
});
