<?php
// src/Command/MigrateMessagesToConversationsCommand.php
namespace App\Command;

use App\Entity\Conversation;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:migrate:messages-to-conversations',
    description: 'Migre les messages existants vers le système de conversations'
)]
class MigrateMessagesToConversationsCommand extends Command
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Migration des messages vers le système de conversations');

        // 1. Récupérer toutes les paires d'utilisateurs ayant échangé des messages
        $sql = "
            SELECT DISTINCT
                LEAST(m.sender_id, m.receiver_id) as user1_id,
                GREATEST(m.sender_id, m.receiver_id) as user2_id
            FROM messages m
            WHERE m.conversation_id IS NULL OR m.conversation_id = 0
            GROUP BY LEAST(m.sender_id, m.receiver_id), GREATEST(m.sender_id, m.receiver_id)
        ";

        $conn = $this->entityManager->getConnection();
        $stmt = $conn->prepare($sql);
        $result = $stmt->executeQuery();
        $pairs = $result->fetchAllAssociative();

        $io->progressStart(count($pairs));

        foreach ($pairs as $pair) {
            $user1 = $this->entityManager->getRepository(User::class)->find($pair['user1_id']);
            $user2 = $this->entityManager->getRepository(User::class)->find($pair['user2_id']);

            if ($user1 && $user2) {
                // Créer la conversation
                $conversation = new Conversation();
                $conversation->setUser1($user1);
                $conversation->setUser2($user2);
                $conversation->setCreatedAt(new \DateTimeImmutable());
                $conversation->setUpdatedAt(new \DateTimeImmutable());

                $this->entityManager->persist($conversation);
                $this->entityManager->flush();

                // Mettre à jour les messages avec l'ID de conversation
                $updateSql = "
                    UPDATE messages
                    SET conversation_id = :conversationId
                    WHERE (sender_id = :user1Id AND receiver_id = :user2Id)
                       OR (sender_id = :user2Id AND receiver_id = :user1Id)
                    AND (conversation_id IS NULL OR conversation_id = 0)
                ";

                $updateStmt = $conn->prepare($updateSql);
                $updateStmt->executeStatement([
                    'conversationId' => $conversation->getId(),
                    'user1Id' => $user1->getId(),
                    'user2Id' => $user2->getId()
                ]);
            }

            $io->progressAdvance();
        }

        $io->progressFinish();
        $io->success('Migration terminée avec succès!');

        return Command::SUCCESS;
    }
}
