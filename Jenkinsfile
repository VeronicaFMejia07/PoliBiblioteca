pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    triggers {
        pollSCM('H/2 * * * *')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git log -1 --oneline'
            }
        }

        stage('Build') {
            steps {
                sh 'cp -n .env.example .env || true'
                sh 'docker compose build'
            }
        }

        stage('Test') {
            steps {
                sh '''
                    set -e
                    docker compose up -d --wait

                    echo "--- Monitoreo de la API por nombre de servicio ---"
                    docker compose exec -T frontend wget -qO- http://api:8000/api/health

                    echo "--- Leer libros ---"
                    docker compose exec -T frontend wget -qO- http://api:8000/api/books
                '''
            }
        }
    }

    post {
        always {
            sh 'docker compose logs --no-color > compose.log || true'
            archiveArtifacts artifacts: 'compose.log', allowEmptyArchive: true
            sh 'docker compose down -v || true'
        }
        success { echo 'Pipeline OK' }
        failure { echo 'Pipeline FALLÓ, revisar compose.log' }
    }
}