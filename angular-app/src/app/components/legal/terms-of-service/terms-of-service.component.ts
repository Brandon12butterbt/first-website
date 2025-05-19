import { Component } from '@angular/core';

@Component({
  selector: 'app-terms-of-service',
  standalone: false,
  templateUrl: './terms-of-service.component.html',
  styleUrls: ['./terms-of-service.component.css']
})
export class TermsOfServiceComponent {
  sections = [
    {
      title: 'Acceptance of Terms',
      content: `By accessing or using our AI-powered text-to-image generation service, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.`
    },
    {
      title: 'Description of Service',
      content: `Our application provides AI-powered text-to-image generation with gallery storage capabilities. Users can create images using text prompts and store them in their personal galleries.`
    },
    {
      title: 'User Accounts',
      content: `To use certain features of our service, you must register for an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.`
    },
    {
      title: 'User Content',
      content: `You retain ownership of the text prompts you submit and the images you generate using our service. However, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and display the generated images solely for the purpose of providing and improving our service.`
    },
    {
      title: 'Prohibited Uses',
      content: `You agree not to use our service to:
      - Generate or distribute content that is illegal, harmful, threatening, abusive, or otherwise objectionable
      - Infringe on the intellectual property rights of others
      - Attempt to gain unauthorized access to our systems or user accounts
      - Use our service for any commercial purpose without our express consent`
    },
    {
      title: 'Termination',
      content: `We reserve the right to terminate or suspend your account and access to our service at our sole discretion, without notice, for any reason, including if you violate these Terms of Service.`
    },
    {
      title: 'Limitation of Liability',
      content: `Our service is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of our service.`
    },
    {
      title: 'Changes to Terms',
      content: `We may update these Terms of Service from time to time. We will notify you of any changes by posting the new terms on this page.`
    },
    {
      title: 'Contact Us',
      content: `If you have any questions about these Terms of Service, please contact us at <a href="mailto:afluxgen.help@gmail.com">afluxgen.help@gmail.com</a> or visit our <a href="/contact">Contact Support</a> page.`
    }
  ];
} 