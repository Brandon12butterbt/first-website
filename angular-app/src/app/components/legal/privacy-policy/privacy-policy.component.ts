import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy-policy',
  standalone: false,
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css']
})
export class PrivacyPolicyComponent {
  sections = [
    {
      title: 'Information We Collect',
      content: `We collect several types of information from and about users of our application, including:
      - Personal information (such as email address) that you provide when registering
      - Usage information about your activities on our application
      - AI-generated images and prompts you create using our service`
    },
    {
      title: 'How We Use Your Information',
      content: `We use the information we collect to:
      - Provide and improve our text-to-image generation service
      - Store your generated images in your personal gallery
      - Maintain and improve our application functionality
      - Respond to your inquiries and customer service requests
      - Send updates, security alerts, and support messages`
    },
    {
      title: 'Data Storage and Security',
      content: `We implement appropriate security measures to protect your personal information from unauthorized access or disclosure. Your generated images are stored securely in your gallery and are only accessible with your authentication credentials.`
    },
    {
      title: 'Third-Party Services',
      content: `Our application may use third-party services for authentication, image processing, and hosting. These services have their own privacy policies governing how they use information.`
    },
    {
      title: 'Your Choices',
      content: `You can access, update, or delete your personal information through your account settings. You can delete AI-generated images from your gallery at any time.`
    },
    {
      title: 'Updates to Our Privacy Policy',
      content: `We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.`
    },
    {
      title: 'Contact Us',
      content: `If you have any questions about this privacy policy, please contact us at "afluxgen.help@gmail.com".`
    }
  ];
} 