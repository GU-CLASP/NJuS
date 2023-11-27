import convokit
from convokit import Corpus, download

corpus = Corpus(download('reddit-corpus-small'))

corpus.print_summary_stats()

conv_ids = corpus.get_conversation_ids()

for conv_id in conv_ids:
    conv = corpus.get_conversation(conv_id)
    utt_ids = conv.get_utterance_ids()
    filename = "data/reddit-corpus-small/{}-{}.tsv".format(conv.retrieve_meta('subreddit'), conv_id)
    print("writing to:", filename)
    conv.get_utterances_dataframe().to_csv(filename, sep="\t")
        # for utt_id in utt_ids:
        #     f.write("{}\t{}\n".format(corpus.get_utterance(utt_id).speaker.id,
        #                               corpus.get_utterance(utt_id).text))

