<?php
// src/Command/WaterReminderCommand.php

namespace App\Command;

use App\Entity\User;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:water-reminder',
    description: 'Send water reminder notifications to ALL users'
)]
class WaterReminderCommand extends Command
{
    private NotificationService $notificationService;
    private EntityManagerInterface $entityManager;

    public function __construct(
        NotificationService $notificationService,
        EntityManagerInterface $entityManager
    ) {
        parent::__construct();
        $this->notificationService = $notificationService;
        $this->entityManager = $entityManager;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        try {
            $io->info('Envoi des rappels d\'hydratation à TOUS les utilisateurs...');

            $users = $this->entityManager->getRepository(User::class)->findAll();
            $userCount = count($users);

            if ($userCount === 0) {
                $io->warning('Aucun utilisateur trouvé dans la base de données.');
                return Command::SUCCESS;
            }

            $io->progressStart($userCount);

            $notificationsCreated = 0;
            foreach ($users as $user) {
                try {
                    $this->notificationService->sendWaterReminder($user);
                    $notificationsCreated++;
                } catch (\Exception $e) {
                    $io->warning(sprintf(
                        'Erreur pour l\'utilisateur %s (ID: %d): %s',
                        $user->getEmail(),
                        $user->getId(),
                        $e->getMessage()
                    ));
                }

                $io->progressAdvance();
            }

            $io->progressFinish();

            $io->success(sprintf(
                '✅ Rappels d\'eau envoyés à %d utilisateurs sur %d',
                $notificationsCreated,
                $userCount
            ));

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $io->error('Erreur: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
