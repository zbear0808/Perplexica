import { BedrockChat } from '@langchain/community/chat_models/bedrock';
import { ChatModel } from '.';
import {
  getBedrockAccessKeyId,
  getBedrockSecretAccessKey,
  getBedrockRegion,
  loadAwsCredentialsFromFile,
} from '../config';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

export const PROVIDER_INFO = {
  key: 'bedrock',
  displayName: 'AWS Bedrock',
};

const bedrockChatModels: Record<string, string>[] = [
  {
    displayName: 'Claude 3.5 Sonnet v2',
    key: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  },
  {
    displayName: 'Claude 3.5 Sonnet',
    key: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
  },
  {
    displayName: 'Claude 3.5 Haiku',
    key: 'anthropic.claude-3-5-haiku-20241022-v1:0',
  },
  {
    displayName: 'Claude 3 Opus',
    key: 'anthropic.claude-3-opus-20240229-v1:0',
  },
  {
    displayName: 'Claude 3 Sonnet',
    key: 'anthropic.claude-3-sonnet-20240229-v1:0',
  },
  {
    displayName: 'Claude 3 Haiku',
    key: 'anthropic.claude-3-haiku-20240307-v1:0',
  },
];

export const loadBedrockChatModels = async () => {
  // First try to load credentials from JSON file
  const fileCredentials = loadAwsCredentialsFromFile();

  // Fallback to config.toml values
  const accessKeyId = fileCredentials?.accessKeyId || getBedrockAccessKeyId();
  const secretAccessKey =
    fileCredentials?.secretAccessKey || getBedrockSecretAccessKey();
  const region = fileCredentials?.region || getBedrockRegion();
  const sessionToken = fileCredentials?.sessionToken;

  if (!accessKeyId || !secretAccessKey || !region) {
    console.log(
      'AWS Bedrock credentials not found. Please check your credentials file or config.toml',
    );
    return {};
  }

  try {
    const chatModels: Record<string, ChatModel> = {};

    bedrockChatModels.forEach((model) => {
      const credentials: any = {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      };

      // Add session token if available (required for temporary credentials)
      if (sessionToken) {
        credentials.sessionToken = sessionToken;
      }

      chatModels[model.key] = {
        displayName: model.displayName,
        model: new BedrockChat({
          region: region,
          credentials: credentials,
          model: model.key,
          temperature: 0.7,
        }) as unknown as BaseChatModel,
      };
    });

    console.log(
      `Loaded ${Object.keys(chatModels).length} AWS Bedrock models from region: ${region}`,
    );
    return chatModels;
  } catch (err) {
    console.error(`Error loading AWS Bedrock models: ${err}`);
    return {};
  }
};
